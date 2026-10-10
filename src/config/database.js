import mongoose from 'mongoose';

// connect to the mongodb database using the uri from environment variables
export const connectdb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`mongodb connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`database connection error: ${error.message}`);
        // exit the process with failure if the database cannot connect
        process.exit(1);
    }
};