import { Router } from 'express';
import { signIn, signUp } from '../handlers/authHandler';

const authRouter = Router();

authRouter.route('/signUp').post(signUp);
authRouter.route('/signIn').post(signIn);

export default authRouter;
