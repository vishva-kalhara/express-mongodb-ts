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

authRouter.use(protect);

authRouter.patch('/updateMyPassword', updateMyPassword);

export default authRouter;
