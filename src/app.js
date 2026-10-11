import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { configurepassport } from './config/passport.js';
import { bearerauth } from './middleware/bearer.js';
import authroutes from './routes/authroutes.js';
import cleanupsroutes from './routes/cleanupsroutes.js';
import commentsroutes from './routes/commentsroutes.js';
import usersroutes from './routes/usersroutes.js';
import reportsroutes from './routes/reportsroutes.js';
import { errorhandler } from './middleware/errorhandler.js';

const app = express();

// render sits behind a https proxy
app.set('trust proxy', 1);

// resolve paths for es modules to read the swagger.json file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, '../swagger.json'), 'utf-8'));

// parse incoming json request bodies
app.use(express.json());

// enable cross-origin resource sharing
app.use(cors());

// sessions keep the user logged in after github oauth, stored in mongodb outside of tests
const isproduction = process.env.NODE_ENV === 'production';
if (isproduction && !process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set in production');
}
app.use(session({
    secret: process.env.SESSION_SECRET || 'development-only-secret',
    resave: false,
    saveUninitialized: false,
    store: process.env.NODE_ENV === 'test' ? undefined : MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        httpOnly: true,
        secure: isproduction, // https only on render (trust proxy is enabled above)
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
configurepassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(bearerauth);

// custom options for swagger ui behind render https proxy
const swaggerOptions = {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css',
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js'
    ]
};

// setup swagger ui documentation route with cdn assets to prevent blank screen on render
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// the live url opens the swagger documentation directly
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// basic health check route to verify deployment status
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'welcome to the ecomap api' });
});

// mount application routes
app.use('/auth', authroutes);
app.use('/users', usersroutes);
app.use('/reports', reportsroutes);
app.use('/cleanups', cleanupsroutes);
app.use('/comments', commentsroutes);

// route not found handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'requested endpoint does not exist' });
});

// central error handling middleware (must be mounted last)
app.use(errorhandler);

export default app;