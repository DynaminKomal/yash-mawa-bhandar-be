import { Request, Response, NextFunction } from 'express';
import { stringify } from 'flatted';

// Custom error interface
interface AppError extends Error {
    statusCode?: number;
    name: string;
}

// Utility function to send responses
export const sendResponse = (
    res: Response,
    statusCode: number,
    status: string,
    message: string,
    data: any = null
): void => {
    res.status(statusCode).json({
        statusCode,
        status,
        message,
        length: data === null ? 0 : data.length,
        data,
    });
};

// Centralized error handler
export const handleError = (res: Response, err: AppError): void => {
    const statusCode = err.statusCode || 400;

    const errorDetails =
        process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred.'
            : stringify(err);

    if (process.env.NODE_ENV === 'production') {
        if (err.name === 'TokenExpiredError') {
            sendResponse(res, statusCode, 'fail', 'Token Expired. Please log in again.');
        } else if (err.name === 'JsonWebTokenError') {
            sendResponse(res, statusCode, 'fail', 'Invalid Token. Please log in again.');
        } else {
            sendResponse(res, statusCode, 'fail', errorDetails);
        }
    } else {
        // Development mode
        if (err.name === 'TokenExpiredError') {
            sendResponse(
                res,
                statusCode,
                'fail',
                `Token Expired. Please log in again. Details: ${err.message}`
            );
        } else if (err.name === 'JsonWebTokenError') {
            sendResponse(
                res,
                statusCode,
                'fail',
                `Invalid Token. Please log in again. Details: ${err.message}`
            );
        } else if (err.name === 'ValidationError') {
            sendResponse(res, statusCode, 'fail', err.message);
        } else {
            sendResponse(
                res,
                statusCode,
                'fail',
                `An unexpected error occurred. Details: ${errorDetails}`
            );
        }
    }
};

// Global async error wrapper
export const grasp =
    (
        cb: (req: Request, res: Response, next: NextFunction) => Promise<any>
    ) =>
        (req: Request, res: Response, next: NextFunction): void => {
            cb(req, res, next).catch((err: AppError) => {
                handleError(res, err);
            });
        };