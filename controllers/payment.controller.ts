import { Request, Response } from "express";
import { AuthRequest } from "../types/express.d";
import { grasp, sendResponse } from "../utility/response-utility";
import * as paymentService from "../services/payment.service";
import Order from "../models/order.model";
import { generateInvoicePdf } from "../services/invoice.service";
import { GetOrdersParams } from "../types/payment.type";

export const createRazorpayOrderController =
    grasp(
        async (
            req: AuthRequest,
            res: Response
        ) => {
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
        }
    );

export const verifyPaymentController =
    grasp(
        async (
            req: AuthRequest,
            res: Response
        ) => {
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
        }
    );

export const generateInvoiceController =
    grasp(
        async (
            req: Request,
            res: Response
        ) => {
            const {
                orderId,
            } = req.params;

            const order =
                await Order.findById(
                    orderId
                );

            if (!order) {
                return sendResponse(
                    res,
                    404,
                    "error",
                    "Order not found"
                );
            }

            const invoice =
                await generateInvoicePdf(
                    order
                );

            sendResponse(
                res,
                200,
                "success",
                "Invoice generated successfully",
                invoice
            );
        }
    );

export const getAllOrdersController = grasp(
    async (req, res) => {
        const {
            page,
            limit,
            search,
            orderStatus,
            paymentMethod,
            paymentStatus
        } = req.validatedQuery;
        const response =
            await paymentService.getAllOrdersService(
                {
                    page, limit, search, orderStatus, paymentMethod, paymentStatus
                }
            );

        sendResponse(
            res,
            200,
            "success",
            "Orders fetched successfully",
            response
        );
    }
);

export const cancelOrderController = grasp(
    async (
        req: AuthRequest,
        res: Response
    ) => {
        const { id } = req.validatedParams;

        const response =
            await paymentService.cancelOrderService({
                orderId: id,
                userId: req.user._id,
                cancelReason:
                    req.validatedBody.cancelReason,
            });

        sendResponse(
            res,
            200,
            "success",
            "Order cancelled successfully",
            response
        );
    }
);

export const updateOrderStatusController = grasp(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { orderStatus, cancelReason } = req.body;

        if (orderStatus === undefined) {
            return sendResponse(res, 400, "error", "orderStatus is required.");
        }

        const orderIdStr = Array.isArray(id) ? id[0] : String(id);
        const response = await paymentService.updateOrderStatusService({
            orderId: orderIdStr,
            orderStatus: Number(orderStatus),
            cancelReason,
        });

        sendResponse(
            res,
            200,
            "success",
            "Order status updated successfully",
            response
        );
    }
);