import mongoose from 'mongoose';
import { IUserDocument } from '../types/userTypes';

const userSchema = new mongoose.Schema<IUserDocument>({
    name: {
        type: String,
        required: [true, 'Please provide the name'],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Please provide the email'],
    },
    password: {
        type: String,
        minlength: [8, 'Password must include 8 characters minimum.'],
        required: [true, 'Pleas eprovide the password'],
        trim: true,
        select: false,
    },
});

export default mongoose.model<IUserDocument>('User', userSchema);
