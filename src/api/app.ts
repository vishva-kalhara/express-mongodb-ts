import express from 'express';
import userRouter from './routes/userRoutes';
import errorHandler from './middlewares/errorHandler';
import authRouter from './routes/authRoutes';

export function createApp() {
    const app = express();

    app.use(express.json({ limit: '10kb' }));

    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/users', userRouter);

    app.use(errorHandler);

    return app;
}
