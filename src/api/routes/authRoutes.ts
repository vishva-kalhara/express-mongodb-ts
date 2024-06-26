import { Router } from 'express';
import {
    forgetPassword,
    resetPassword,
    signIn,
    signUp,
    updateMyPassword,
} from '../handlers/authHandler';
import protect from '../middlewares/protect';

const authRouter = Router();

authRouter.route('/signUp').post(signUp);
authRouter.route('/signIn').post(signIn);

authRouter.get('/forgetPassword', forgetPassword);
authRouter.patch('/updateMyPassword/:token', resetPassword);

authRouter.patch('/updateMyPassword', protect, updateMyPassword);

export default authRouter;
