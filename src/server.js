// load environment variables first, before app.js reads them (es module imports are hoisted)
import 'dotenv/config';
import app from './app.js';
import { connectdb } from './config/database.js';

const port = process.env.PORT || 3000;

// initialize the application by connecting to the database then starting the server
const startserver = async () => {
    await connectdb();
    
    app.listen(port, () => {
        console.log(`ecomap server running in ${process.env.NODE_ENV} mode on port ${port}`);
    });
};

startserver();