import dotenv from 'dotenv';
const envFilePath = (() => {
    switch (process.env.NODE_ENV) {
        case 'production':
            return '../configs/.env.prod';
        case 'development':
            return '../configs/.env.dev';
        case 'test':
            return '../configs/.env.test';
        default:
            return '../configs/.env';
    }
})();

dotenv.config({ path: envFilePath });

import { createApp } from './app';
// import mongoose from 'mongoose';

import connectDB from './db';

const app = createApp();

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception! Server is shutting down...');
    console.log(err.name, err.message);
    // console.log(err)
    process.exit(1);
});

const PORT = process.env.PORT || (3001 as const);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
});
