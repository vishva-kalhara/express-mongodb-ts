import { Response } from 'express';
import restrictTo from '../../api/middlewares/restrictTo';
import { IRequestWithUser } from '../../api/types/authTypes';
import AppError from '../../api/utils/appError';

describe('restrictTo() middleware', () => {
    it('Should grant access if user is allowed', async () => {
        const req = {
            user: { role: 'Admin' },
        } as IRequestWithUser;

        const res = {} as Response;
        const next = jest.fn();

        restrictTo(['Admin', 'User'], req as IRequestWithUser, res, next);

        expect(next).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('Should not grant access if user is allowed', async () => {
        const req = {
            user: { role: 'User' },
        } as IRequestWithUser;

        const res = {} as Response;
        const next = jest.fn();

        restrictTo(['Admin'], req as IRequestWithUser, res, next);

        const error = next.mock.calls[0][0];
        expect(error.statusCode).toBe(403);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
});
