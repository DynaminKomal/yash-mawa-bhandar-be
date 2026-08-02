import { UploadedFile } from "express-fileupload";
import * as userService from "../services/user.service";
import { grasp, sendResponse } from "../utility/response-utility";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
    files?: any;
}

export const updateUserProfileController = grasp(
    async (req: AuthRequest, res: Response) => {

        const file = req.files?.profile as UploadedFile;

        const user = await userService.updateUserProfile(
            req.user._id,
            req.validatedBody,
            file
        );

        sendResponse(
            res,
            200,
            "success",
            "User profile updated successfully",
            null
        );
    }
);


export const getUserProfileController = grasp(
    async (req: AuthRequest, res: Response) => {
        const user = await userService.getUserProfile(req.user._id);
        sendResponse(res, 201, "success", "User profile fetched successfully", user);
    }
);

export const deactivateUserController = grasp(
    async (req: AuthRequest, res: Response) => {
        await userService.deactivateUser(req.user._id);
        sendResponse(res, 201, "success", "User deleted successfully", null);
    }
);

export const updatePasswordController = grasp(
    async (req: AuthRequest, res: Response) => {
        const payload = {
            ...req.validatedBody,
            user: req.user._id,
        }
        await userService.updatePassword(payload);
        sendResponse(res, 201, "success", "Password updated successfully", null);
    }
);

export const getAllUsersController = grasp(
    async (req: Request, res: Response) => {
        const { page, limit, search, role, isActive } = req.query;
        const response = await userService.getAllUsersService({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            search: search ? String(search) : "",
            role: role ? String(role) : undefined,
            isActive: isActive ? String(isActive) : undefined,
        });

        sendResponse(res, 200, "success", "Users fetched successfully", response);
    }
);