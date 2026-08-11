import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/express.d";
import { grasp, sendResponse } from "./response-utility";
import Users from "../models/users.model";

interface DecodedToken extends JwtPayload {
    id: string;
    iat: number;
}
export const tokenVerify = grasp(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        let token: string | undefined;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return sendResponse(
                res,
                401,
                "fail",
                "You have no token. Please try again to login!"
            );
        }

        try {
            const decodedToken = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as DecodedToken;

            const userExist = await Users.findById(decodedToken.id);

            if (!userExist) {
                return sendResponse(
                    res,
                    401,
                    "fail",
                    "User does not exist."
                );
            }

            req.user = userExist;

            return next();

        } catch (error) {
            console.error("Error in tokenVerify middleware:", error);
            return sendResponse(
                res,
                401,
                "fail",
                "Invalid token or token expired."
            );
        }
    }
);

export const optionalTokenVerify = grasp(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        let token: string | undefined;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next();
        }

        try {
            const decodedToken = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as DecodedToken;

            const userExist = await Users.findById(decodedToken.id);
            if (userExist) {
                req.user = userExist;
            }
        } catch (error) {
            // Silence optional token parse errors for public APIs
        }

        return next();
    }
);

export const adminVerify = grasp(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== "admin") {
            return sendResponse(
                res,
                403,
                "fail",
                "Access denied. Admin privileges required."
            );
        }
        return next();
    }
);