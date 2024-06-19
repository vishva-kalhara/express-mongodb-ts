import { NextFunction, Request, Response } from 'express';
import { IGetAllUsersResponse, IGetUserResponse } from '../types/userTypes';
import catchAsync from '../utils/catchAsync';
import { dummyUsers } from '../../__data__/dummy-users';
import { filterObj } from '../utils/filterObj';
import userSchema from '../schemas/userSchema';
import { IRequestWithUser } from '../types/authTypes';

export const getAllUsers = catchAsync(
    async (
        _req: Request,
        res: Response<IGetAllUsersResponse>,
        _next: NextFunction
    ) => {
        res.status(200).json({
            status: 'success',
            count: dummyUsers.length,
            data: dummyUsers,
        });
    }
);

export const getUser = catchAsync(
    async (
        _req: Request<{ id: number }>,
        res: Response<IGetUserResponse>,
        _next: NextFunction
    ) => {
        res.status(200).json({
            status: 'success',
            data: dummyUsers[0],
        });
    }
);

export const updateMe = catchAsync(
    async (req: IRequestWithUser, res: Response, _next: NextFunction) => {
        const filteredBody = filterObj(req.body, 'name');
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
