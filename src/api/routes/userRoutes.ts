import { Router } from 'express';
import { getAllUsers, getUser, updateMe } from '../handlers/userHandler';
import protect from '../middlewares/protect';

const userRouter = Router();

userRouter.route('/').get(getAllUsers);
userRouter.route('/:id').get(getUser).patch(protect, updateMe);

export default userRouter;
