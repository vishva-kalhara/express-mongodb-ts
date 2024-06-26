import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import User from '../schemas/userSchema';
import { IUserDocument, IUserInput } from '../types/userTypes';
import { IRequestUpdateMyPassword, ISignInRequest } from '../types/authTypes';
import AppError from '../utils/appError';
import Email from '../utils/email';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signJWT = (id: String) =>
    jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

export const isPasswordMatch = async (
    plainPassword: string,
    hashedPassword: string
) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const createSendToken = (
    user: IUserDocument,
    statusCode: number,
    res: Response
) => {
    const token = signJWT(user._id);

    const jwtExpiresIn = Number(process.env.JWT_COOKEI_EXPIRES_IN as string);

    const cookieOptions = {
        expires: new Date(Date.now() + jwtExpiresIn * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
    };

    res.cookie('jwt', token, cookieOptions);

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    user.password = '';

    res.status(statusCode).json({
        status: 'success',
        jwt: token,
        data: {
            user,
        },
    });
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

        await new Email(
            newUser,
            'https://github.com/vishva-kalhara/express-mongodb-ts'
        ).sendWelcome();

        createSendToken(newUser, 201, res);
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

        createSendToken(user, 200, res);
    }
);

export const updateMyPassword = catchAsync(
    async (
        req: IRequestUpdateMyPassword,
        res: Response,
        next: NextFunction
    ) => {
        // Destruct body
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword)
            return next(
                new AppError('Please provide the current password', 400)
            );
        if (!newPassword)
            return next(new AppError('Please provide the new password', 400));
        if (!confirmPassword)
            return next(
                new AppError('Please provide the confirm password', 400)
            );

        // Get current user with password
        const currentUser = await User.findById(req.user._id).select(
            '+password'
        );
        if (!currentUser)
            return next(new AppError('Please sign in to the application', 401));

        // Check whether the current password match
        const isMatched = await isPasswordMatch(
            currentPassword,
            currentUser!.password
        );
        if (!isMatched)
            return next(new AppError('Current password does not match', 400));

        // Update password
        currentUser.password = newPassword;
        currentUser.confirmPassword = confirmPassword;
        await currentUser.save();

        createSendToken(currentUser, 200, res);
    }
);

export const forgetPassword = catchAsync(
    async (
        _req: IRequestUpdateMyPassword,
        _res: Response,
        _next: NextFunction
    ) => {}
);

export const resetPassword = catchAsync(
    async (
        _req: IRequestUpdateMyPassword,
        _res: Response,
        _next: NextFunction
    ) => {}
);
