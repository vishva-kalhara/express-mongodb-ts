import mongoose from 'mongoose';

const connectDB = async () => {
    const DB = process.env.DATABASE_URI as string;

    try {
        await mongoose.connect(DB);
        console.log(`Connected to ${process.env.NODE_ENV} DB...`);
    } catch (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
};

export default connectDB;
