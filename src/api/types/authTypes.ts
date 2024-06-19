import { Request } from 'express';
import { IUserDocument } from './userTypes';

export interface ISignInRequest {
    email: String | undefined;
    password: String | undefined;
}

export interface IRequestWithUser extends Request {
    user: IUserDocument;
}
