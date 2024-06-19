import AppError from '../utils/appError';

export interface errorDetails {
    name: string;
    message: string;
    properties?: {};
    kind: string;
    path: string;
}

export interface errorType extends AppError {
    errors: errorDetails[];
}

export interface mongooseValidationError {
    field: string;
    message: string;
}

export interface duplicateDocumentError extends AppError {
    errorResponse: {
        errmsg: String;
    };
}
