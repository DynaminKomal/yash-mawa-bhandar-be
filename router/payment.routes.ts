import { Router } from "express";

import { tokenVerify } from "../utility/token-verify";
import {
    createRazorpayOrderController,
    generateInvoiceController,
    getAllOrdersController,
    verifyPaymentController,
} from "../controllers/payment.controller";
import { validate } from "../validator/validate";
import { getOrderSchema } from "../validator/order/verifyPaymentSchema.config";

const router = Router();

router.use(tokenVerify);

router.post("/create-razorpay-order", createRazorpayOrderController);

router.post("/verify-payment", verifyPaymentController);

router.get("/generate-invoice/:orderId", generateInvoiceController);
router.get("/orders", validate(getOrderSchema, "query"), getAllOrdersController);

export default router;