import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

interface AppError extends Error {
    statusCode?: number;
}

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
        length: Array.isArray(data) ? data.length : data ? 1 : 0,
        data,
    });
};

export const grasp =
    <
        P = any,
        ResBody = any,
        ReqBody = any,
        ReqQuery = any
    >(
        cb: (
            req: Request<P, ResBody, ReqBody, ReqQuery>,
            res: Response,
            next: NextFunction
        ) => Promise<any>
    ) =>
        (req: Request, res: Response, next: NextFunction): void => {
            cb(req as any, res, next).catch(next);
        };

export const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 400;

    let message = "Something went wrong";

    if (err instanceof ZodError) {
        message = err.issues[0]?.message || "Validation error";
    } else if (err instanceof Error) {
        message = err.message;
    }

    sendResponse(res, statusCode, "fail", message);
};