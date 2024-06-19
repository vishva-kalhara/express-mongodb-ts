import { Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { promisify } from 'util';
import jwt, { JwtPayload } from 'jsonwebtoken';
import userSchema from '../schemas/userSchema';

import { IUserDocument } from '../types/userTypes';
import { IRequestWithUser } from '../types/authTypes';

// Define the expected payload type
interface MyJwtPayload extends JwtPayload {
    userId: string;
}

const verifyAsync = promisify(jwt.verify) as (
    token: string,
    secretOrPublicKey: string
) => Promise<JwtPayload>;

export default catchAsync(
    async (req: IRequestWithUser, _res: Response, next: NextFunction) => {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token)
            return next(
                new AppError(
                    "You're not logged in! please log in to the application",
                    401
                )
            );

        const decoded = (await verifyAsync(
            token,
            process.env.JWT_SECRET as string
        )) as MyJwtPayload;

        const userExist = (await userSchema.findById(
            decoded.id
        )) as IUserDocument;
        if (!userExist)
            return next(
                new AppError(
                    'The User associated with this token is deleted.',
                    401
                )
            );

        const isChangedPassword = await userExist.isPasswordChanged(
            decoded.iat as number
        );
        if (isChangedPassword)
            return next(
                new AppError(
                    'User recently changed password! Please login again.',
                    401
                )
            );

        req.user = userExist;
        next();
    }
);
