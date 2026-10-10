import dotenv from 'dotenv';
import app from './app.js';
import { connectdb } from './config/database.js';

// load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 3000;

// initialize the application by connecting to the database then starting the server
const startserver = async () => {
    await connectdb();
    
    app.listen(port, () => {
        console.log(`ecomap server running in ${process.env.NODE_ENV} mode on port ${port}`);
    });
};

startserver();