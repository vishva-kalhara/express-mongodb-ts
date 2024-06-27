import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '../types/authTypes';
import AppError from '../utils/appError';

export default (...roles: string[]) =>
    (req: IRequestWithUser, _res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
