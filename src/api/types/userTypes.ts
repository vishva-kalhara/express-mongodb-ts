import mongoose from 'mongoose';

export interface IUserInput {
    name: String;
    email: string;
    password: string;
    confirmPassword: string | undefined;
    role: 'Admin' | 'User';
    // role: string; //'Admin' | 'User'
    isActive: boolean;
}

export interface IUserDocument extends IUserInput, mongoose.Document {
    _id: string;
    createdAt?: Date;
    passwordResetAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    isPasswordChanged: (iat: number) => Promise<boolean>;
    createPasswordResetToken: () => string;
}

export interface IGetAllUsersResponse {
    status: String;
    count: Number;
    data: IUserInput[];
}

export interface IGetUserResponse {
    status: String;
    data: IUserInput;
}
