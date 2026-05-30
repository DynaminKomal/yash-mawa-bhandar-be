import { Router } from "express";

import { tokenVerify } from "../utility/token-verify";
import {
    cancelOrderController,
    createRazorpayOrderController,
    generateInvoiceController,
    getAllOrdersController,
    verifyPaymentController,
} from "../controllers/payment.controller";
import { validate } from "../validator/validate";
import { cancelBodySchema, getOrderSchema } from "../validator/order/verifyPaymentSchema.config";
import { mongoIdSchema } from "../validator/common.config";

const router = Router();

router.use(tokenVerify);

router.post("/create-razorpay-order", createRazorpayOrderController);

router.post("/verify-payment", verifyPaymentController);

router.get("/generate-invoice/:orderId", generateInvoiceController);
router.get("/orders", validate(getOrderSchema, "query"), getAllOrdersController);
router.post("/orders/:id/cancel", validate(mongoIdSchema, "params"),
    validate(cancelBodySchema, "body"), cancelOrderController);

export default router;