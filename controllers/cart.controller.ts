import { grasp, sendResponse } from "../utility/response-utility";
import * as cartService from "../services/cart.service";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: any;
}

export const createCartItemController = grasp(
    async (req: AuthRequest, res: Response) => {

        const payload = {
            ...req.validatedBody,
            user: req.user._id,
        };

        const cart = await cartService.createCartItems(payload);

        sendResponse(res, 201, "success", "Cart created successfully", cart);
    }
);

export const getCartController = async (req: any, res: any) => {

    const cart = await cartService.getCartForUser(req.user._id);

    sendResponse(res, 201, "success", "Cart fetched successfully", cart);

};

export const updateCartController = async (req: any, res: any) => {
    await cartService.updateCartItem({
        user: req.user._id,
        productId: req.validatedBody.productId,
        quantity: req.validatedBody.quantity,
    });

    sendResponse(res, 201, "success", "Cart update successfully", null);
};

export const deleteCartController = async (req: any, res: any) => {

    await cartService.deleteCartItem({
        user: req.user._id,
        productId: req.params.productId,
    });

    sendResponse(res, 201, "success", "Cart delete successfully", null);

};