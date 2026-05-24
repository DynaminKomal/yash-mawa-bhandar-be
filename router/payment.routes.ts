import { Router } from "express";

import { tokenVerify } from "../utility/token-verify";
import {
    createRazorpayOrderController,
    verifyPaymentController,
} from "../controllers/payment.controller";

const router = Router();

router.use(tokenVerify);

router.post(
    "/create-razorpay-order",
    createRazorpayOrderController
);

router.post(
    "/verify-payment",
    verifyPaymentController
);

export default router;