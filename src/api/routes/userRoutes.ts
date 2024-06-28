import { Router } from 'express';
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
// import restrictTo from '../middlewares/restrictTo';

const userRouter = Router();

userRouter.use(protect);

userRouter.route('/updateMe').patch(updateMe);

userRouter.use((_req, _res, next) => {
    console.log('before');
    restrictTo('Admin');
    console.log('after');
    next();
});

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
