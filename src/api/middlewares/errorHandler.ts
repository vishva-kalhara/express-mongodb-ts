import { NextFunction, Request, Response } from 'express';
import AppError from '../../utils/appError';
import {
    duplicateDocumentError,
    errorType,
    mongooseValidationError,
} from '../types/errorTypes';

const handleDuplicateDocuments = (err: duplicateDocumentError) => {
    const matchResult = err.errorResponse.errmsg.match(
        /(["'])(?:(?=(\\?))\2.)*?\1/
    );
    if (matchResult) {
        const value = matchResult[0];
        return new AppError(`There is a record associated to ${value}`, 400);
    } else return new AppError(`Unhandled Error Occured`, 500);
};

const handleValidationErrors = (err: errorType) => {
    const errors: mongooseValidationError[] = Object.values(err.errors).map(
        (el) => {
            return { field: el.path, message: el.message };
        }
    );
    return new AppError(errors, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: { ...err, name: err.name },
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err: AppError, res: Response) => {
    // console.log(err);
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            data: err.errorBody || undefined,
        });
    } else {
        console.error('Error 💥💥', err);
        res.status(500).json({
            status: 'error',
            message:
                err.message || 'Something went wrong. Please try again later.',
        });
    }
};

export default (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    let error = err;
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';
    if (
        (process.env.NODE_ENV as string) === 'production' ||
        (process.env.NODE_ENV as string) === 'test'
    ) {
        if (error.name == 'ValidationError')
            error = handleValidationErrors(error as errorType);
        if (error.code === 11000)
            error = handleDuplicateDocuments(error as duplicateDocumentError);
        return sendErrorProd(error, res);
    }
    return sendErrorDev(error, res);
};
