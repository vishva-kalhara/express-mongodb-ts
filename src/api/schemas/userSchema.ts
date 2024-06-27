import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import validator from 'validator';
import { IUserDocument } from '../types/userTypes';
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
        required: [true, 'Please provide the password'],
        trim: true,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please provide the confirm password'],
        trim: true,
        validate: {
            // Works only when using CREATE and SAVE
            validator: function (this: IUserDocument): boolean {
                return this.password === this.confirmPassword;
            },
            message: 'Password and Confirm Password does not match.',
        },
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

    this.password = await bcrypt.hash(this.password, 10);

    this.confirmPassword = undefined;

    next();
});

User.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordResetAt = new Date(Date.now() - 10000); // Don't persist in the DB
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

User.methods.createPasswordResetToken = function () {
    // Generate Random token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the token
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Update the document
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

export default mongoose.model<IUserDocument>('User', User);
