import { Request, Response, NextFunction } from "express";
import { createProductSchema } from "./product.config";

export const validateCreateProduct = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Error("Body is required");
        }
        req.validatedBody = createProductSchema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};