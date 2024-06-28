import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '../types/authTypes';
import AppError from '../utils/appError';

const restrictTo = (
    roles: string[],
    req: IRequestWithUser,
    _res: Response,
    next: NextFunction
) => {
    // console.log('current role: ',req.user.role)
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

export default restrictTo;
