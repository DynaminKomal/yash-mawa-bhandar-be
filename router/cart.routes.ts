import { Router } from "express";
import { validate } from "../validator/validate";
import { createCartItemController, deleteCartController, getCartController, updateCartController } from "../controllers/cart.controller";
import { createCartSchema, deleteCartParams, updateCartSchema } from "../validator/cart/cart.config";
import { tokenVerify } from "../utility/token-verify";

const router = Router();

router.use(tokenVerify)

router.post("/add-to-cart", validate(createCartSchema, "body"), createCartItemController);
router.get("/list", getCartController);
router.put("/update", validate(updateCartSchema, "body"), updateCartController);
router.delete("/:productId", validate(deleteCartParams, "params"), deleteCartController);


export default router;