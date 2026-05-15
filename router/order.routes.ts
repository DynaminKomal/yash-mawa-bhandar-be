import { Router } from "express";
import { validate } from "../validator/validate";
import { tokenVerify } from "../utility/token-verify";
import { createOrderController } from "../controllers/order.controller";
import { createOrderSchema } from "../validator/order/order.config";

const router = Router();

router.use(tokenVerify)

router.post("/create-order", validate(createOrderSchema, "body"), createOrderController);


export default router;