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
            user
        );
    }
);


export const getUserProfileController = grasp(
    async (req: AuthRequest, res: Response) => {

        const user = await userService.getUserProfile(req.user._id);

        sendResponse(res, 201, "success", "User profile fetched successfully", user);
    }
);