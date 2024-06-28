import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { filterObj } from '../utils/filterObj';
import userSchema from '../schemas/userSchema';
import { IRequestWithUser } from '../types/authTypes';
import {
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../utils/factoryFunctions';

export const getAllUsers = getAll(userSchema);

export const getUser = getOne(userSchema);

// export const createUser = createOne(userSchema);
export const createUser = (_req: Request, res: Response) => {
    res.status(401).json({
        status: 'Unauthorized',
        message: 'Use /sign-up route',
    });
};

export const updateUser = updateOne(userSchema, {
    type: 'include',
    fields: ['name', 'email', 'isActive'],
});

export const deleteUser = deleteOne(userSchema);

export const updateMe = catchAsync(
    async (req: IRequestWithUser, res: Response, _next: NextFunction) => {
        const filteredBody = filterObj(req.body, {
            type: 'include',
            fields: ['name'],
        });
        const updatedUser = await userSchema.findByIdAndUpdate(
            req.user!._id,
            filteredBody,
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            status: 'success',
            data: {
                updatedUser,
            },
        });
    }
);
