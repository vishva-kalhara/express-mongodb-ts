import { NextFunction, Request, Response } from 'express';
import { IGetAllUsersResponse, IGetUserResponse } from '../types/userTypes';
// import { dummyUsers } from '../../__data__/dummy-users';
import catchAsync from '../../utils/catchAsync';
import { dummyUsers } from '../../__data__/dummy-users';

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
