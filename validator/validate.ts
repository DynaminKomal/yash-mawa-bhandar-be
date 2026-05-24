import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
    (
        schema: ZodSchema,
        source: "body" | "query" | "params",
        required: boolean = true
    ) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {

                const requestData = req[source] || {};

                if (
                    required &&
                    typeof requestData === "object" &&
                    Object.keys(requestData).length === 0
                ) {
                    throw new Error(`${source} is required`);
                }

                const data = schema.parse(requestData);

                if (source === "body") req.validatedBody = data;
                if (source === "query") req.validatedQuery = data;
                if (source === "params") req.validatedParams = data;

                next();

            } catch (err) {
                next(err);
            }
        };