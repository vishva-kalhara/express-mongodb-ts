import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import User from '../schemas/userSchema';
import { IUserInput } from '../types/userTypes';

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
