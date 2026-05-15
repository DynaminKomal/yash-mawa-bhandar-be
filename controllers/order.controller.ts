import { grasp, sendResponse } from "../utility/response-utility";
import * as orderService from "../services/order.service";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
}

export const createOrderController = grasp(
    async (req: AuthRequest, res: Response) => {

        const payload = {
            ...req.validatedBody,
            user: req.user._id,
        };

        const cart = await orderService.createOrder(payload);

        sendResponse(res, 201, "success", "Order created successfully", cart);
    }
);
