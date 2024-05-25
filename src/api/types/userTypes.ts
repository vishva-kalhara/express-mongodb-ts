import mongoose from 'mongoose';

export interface IUserInput {
  name: String;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'User';
}

export interface IUserDocument extends IUserInput, mongoose.Schema {
  _id: string;
  createdAt: Date;
  passwordResetAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
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
