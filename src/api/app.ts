import express from 'express';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';

import userRouter from './routes/userRoutes';
import errorHandler from './middlewares/errorHandler';
import authRouter from './routes/authRoutes';
import cors from 'cors';

export function createApp() {
    const app = express();

    // Cross Origin Resource Sharing
    app.use(cors());

    // Enabling PUT, PATCH, DELETE requests
    app.options('*', cors());

    // Setup view engine
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));

    // HTTP Headers
    app.use(helmet());

    // Development Logging
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    app.use(express.json({ limit: '10kb' }));

    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/users', userRouter);

    app.use(errorHandler);

    return app;
}
