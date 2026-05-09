import { Router } from "express";
import { validate } from "../validator/validate";
import { addNewAddress, getAllAddressBYId, } from "../controllers/address.controller";
import { createNewAddress } from "../validator/user/user.config";
import { mongoIdSchema } from "../validator/common.config";

const router = Router();

router.post("/:id/addresses", validate(mongoIdSchema, "params"), validate(createNewAddress, "body"), addNewAddress);
router.get("/:id/addresses", validate(mongoIdSchema, "params"), getAllAddressBYId);


export default router;