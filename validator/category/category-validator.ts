import { Request, Response, NextFunction } from "express";
import { createCategorySchema } from "./category.config";

export const validateCreateCategory = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Error("Body is required");
        }
        req.validatedBody = createCategorySchema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};