import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';
import { duplicateDocumentError, errorType } from '../types/errorTypes';
import {
    handleDuplicateDocuments,
    handleValidationErrors,
    sendErrorDev,
    sendErrorProd,
} from '../handlers/errorHandler';

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
