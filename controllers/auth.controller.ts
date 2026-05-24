import * as authService from "../services/auth.service";
import { grasp, sendResponse } from "../utility/response-utility";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET as string;

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
    process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

const getToken = (id: string, role: string) => {
    return jwt.sign(
        { id, role },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN,
        }
    );
};

export const createUser = grasp(async (req, res) => {
    const user = await authService.signup(req.validatedBody);

    sendResponse(res, 201, "success", "User created", user);
});

export const login = grasp(async (req, res) => {
    const loggedInUser = await authService.login(req.validatedBody);
    const token = getToken(loggedInUser._id.toString(), loggedInUser.role);
    const userData = {
        token: token,
        data: loggedInUser
    }
    sendResponse(res, 201, "success", "Login successful", userData);
});