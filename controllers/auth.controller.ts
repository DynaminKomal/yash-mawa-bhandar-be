import * as authService from "../services/auth.service";
import { grasp, sendResponse } from "../utility/response-utility";

export const createUser = grasp(async (req, res) => {
    const user = await authService.signup(req.validatedBody);

    sendResponse(res, 201, "success", "User created", user);
});