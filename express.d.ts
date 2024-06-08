import * as express from 'express';
import { IUserDocument } from './src/api/types/userTypes';

declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
        }
    }
}
