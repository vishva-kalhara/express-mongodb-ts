import mongoose from 'mongoose';
import validator from 'validator';
import { IUserDocument } from '../types/userTypes';
import bcrypt from 'bcrypt';
import AppError from '../utils/appError';

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
    passwordResetAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

User.pre('save', async function (this, next) {
    if (!this.isModified('password')) return next();

    if (this.password != this.confirmPassword)
        return next(
            new AppError('Password and Confirm Password does not match.', 400)
        );

    console.log(this.password);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);

    this.confirmPassword = undefined;

    next();
});

User.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordResetAt = new Date(Date.now() - 1000); // Don't persist in the DB
    console.log(this);
    next();
});

User.methods.isPasswordChanged = function (JWTTimeStamp: number) {
    if (this.passwordResetAt) {
        const changedTimeStamp = parseInt(
            (this.passwordResetAt.getTime() / 1000).toString(),
            10
        );

        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

export default mongoose.model<IUserDocument>('User', User);
