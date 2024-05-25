import dotenv from 'dotenv';
import { createApp } from './app';
import mongoose from 'mongoose';

const app = createApp();

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception! Server is shutting down...');
    console.log(err.name, err.message);
    // console.log(err)
    process.exit(1);
});

dotenv.config({ path: '../configs/.env.dev' });
const PORT = process.env.PORT || (3001 as const);

if (!process.env.DATABASE_URI) process.env.DATABASE_URI = '';
if (!process.env.DATABASE_PASSWORD) process.env.DATABASE_PASSWORD = '';

const DB = process.env.DATABASE_URI.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

async function dbConnect() {
    await mongoose.connect(DB);
}

dbConnect().then(() => console.log('Connected to DB...'));

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
