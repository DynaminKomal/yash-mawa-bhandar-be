import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema, source: "body" | "query" | "params") =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = schema.parse(req[source]);

            if (source === "body") req.validatedBody = data;
            if (source === "query") req.validatedQuery = data;
            if (source === "params") req.validatedParams = data;

            next();
        } catch (err) {
            next(err);
        }
    };