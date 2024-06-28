import { NextFunction, Request, Response, Router } from 'express';
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    updateMe,
    updateUser,
} from '../handlers/userHandler';
import protect from '../middlewares/protect';
import restrictTo from '../middlewares/restrictTo';
import { IRequestWithUser } from '../types/authTypes';
// import restrictTo from '../middlewares/restrictTo';

const userRouter = Router();

userRouter.use(protect);

userRouter.route('/updateMe').patch(updateMe);

userRouter.use((req: Request, res: Response, next: NextFunction) => {
    restrictTo(['Admin'], req as IRequestWithUser, res, next);
});

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
