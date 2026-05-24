import { Request, Response } from "express";

import { grasp, sendResponse } from "../utility/response-utility";

import * as paymentService from "../services/payment.service";

interface AuthRequest extends Request {
    user?: any;
}

export const createRazorpayOrderController =
    grasp(async (req: AuthRequest, res: Response) => {

        const response =
            await paymentService.createRazorpayOrderService(
                req.body.amount
            );

        sendResponse(
            res,
            200,
            "success",
            "Razorpay order created",
            response
        );
    });

export const verifyPaymentController =
    grasp(async (req: AuthRequest, res: Response) => {

        const payload = {
            ...req.body,
            user: req.user._id,
        };

        const response =
            await paymentService.verifyPaymentService(
                payload
            );

        sendResponse(
            res,
            200,
            "success",
            "Payment verified successfully",
            response
        );
    });