import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import User from '../schemas/userSchema';
import { IUserDocument, IUserInput } from '../types/userTypes';
import { ISignInRequest } from '../types/authTypes';
import AppError from '../../utils/appError';
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// const signJWT = (id: String) => {
//     jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

export const isPasswordMatch = async (
    plainPassword: string,
    hashedPassword: string
) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const signUp = catchAsync(
    async (
        req: Request<{}, {}, IUserInput>,
        res: Response,
        _next: NextFunction
    ) => {
        const { name, email, password, confirmPassword } = req.body;

        const newUser = await User.create({
            name,
            email,
            password,
            confirmPassword,
        });

        res.status(201).json({
            status: 'success',
            data: newUser,
        });
    }
);

export const signIn = catchAsync(
    async (
        req: Request<{}, {}, ISignInRequest>,
        res: Response,
        next: NextFunction
    ) => {
        const { email, password } = req.body;
        if (!email || !password)
            return next(new AppError('Please provide email and password', 400));

        const user: IUserDocument | null = await User.findOne({ email }).select(
            '+password'
        );
        if (!user)
            return next(
                new AppError(
                    'There is no active user associated to this email',
                    401
                )
            );

        const isMatched = await isPasswordMatch(
            password as string,
            user.password
        );
        if (!isMatched)
            return next(new AppError('Password is incorrect.', 401));

        user.password = '';

        res.status(200).json({
            status: 'success',
            jwt: 'demo',
        });
    }
);
