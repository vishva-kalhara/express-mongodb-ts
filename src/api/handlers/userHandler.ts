import { Request, Response } from 'express';
import userSchema from '../schemas/userSchema';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../utils/factoryFunctions';

export const getAllUsers = getAll(userSchema);

export const getUser = getOne(userSchema);

// export const createUser = createOne(userSchema);
export const createUser = (_req: Request, res: Response) => {
    if (process.env.test === 'test') {
        return createOne(userSchema, {
            type: 'include',
            fields: ['name', 'email', 'password', 'confirmPassword', 'role'],
        });
    }

    res.status(401).json({
        status: 'Unauthorized',
        message: 'Use /sign-up route',
    });
};

export const updateUser = updateOne(userSchema, {
    type: 'include',
    fields: ['name', 'email', 'isActive', 'role'],
});

export const deleteUser = deleteOne(userSchema);

export const updateMe = updateOne(userSchema, {
    type: 'include',
    docIdFrom: 'jwt',
    fields: ['name', 'email'],
});
