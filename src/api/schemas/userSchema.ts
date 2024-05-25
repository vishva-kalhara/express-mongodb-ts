import mongoose from 'mongoose';
import validator from 'validator';
import { IUserDocument } from '../types/userTypes';
import bcrypt from 'bcrypt';

const User = new mongoose.Schema<IUserDocument>({
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
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
        type: String,
        minlength: [8, 'Password must include 8 characters minimum.'],
        required: [true, 'Pleas eprovide the password'],
        trim: true,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please provide the confirm password'],
        trim: true,
        validate: function () {
            return this.password === this.confirmPassword;
        },
        message: 'Password and confirm password doen not match',
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

User.pre('save', async function (this, next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);

    this.confirmPassword = undefined;

    next();
});

export default mongoose.model<IUserDocument>('User', User);
