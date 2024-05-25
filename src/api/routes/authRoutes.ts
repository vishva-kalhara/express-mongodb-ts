import { Router } from 'express';
import { signUp } from '../handlers/authHandler';

const authRouter = Router();

authRouter.route('/signUp').post(signUp);

export default authRouter;
