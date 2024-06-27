import { Request } from 'express';
import { IUserDocument } from './userTypes';

export interface ISignInRequest {
    email: String | undefined;
    password: String | undefined;
}

export interface IRequestWithUser extends Request {
    user: IUserDocument;
}

export interface IRequestUpdateMyPassword extends IRequestWithUser {
    body: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
}

export interface IRequestForgetPassword extends IRequestWithUser {
    body: {
        email: string;
    };
}

export interface IRequestResetPassword extends IRequestWithUser {
    params: {
        token: string;
    };
    body: {
        newPassword: string;
        confirmPassword: string;
    };
}
