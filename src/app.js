import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import usersroutes from './routes/usersroutes.js';
import reportsroutes from './routes/reportsroutes.js';
import { errorhandler } from './middleware/errorhandler.js';

const app = express();

// resolve paths for es modules to read the swagger.json file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, '../swagger.json'), 'utf-8'));

// parse incoming json request bodies
app.use(express.json());

// enable cross-origin resource sharing
app.use(cors());

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

// basic health check route to verify deployment status
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'welcome to the ecomap api' });
});

// mount application routes
app.use('/users', usersroutes);
app.use('/reports', reportsroutes);

// route not found handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'requested endpoint does not exist' });
});

// central error handling middleware (must be mounted last)
app.use(errorhandler);

export default app;