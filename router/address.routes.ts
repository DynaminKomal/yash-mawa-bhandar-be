import { Router } from "express";
import { validate } from "../validator/validate";
import {
    deleteAddressById,
    setDefaultAddressById,
    updateAddressById
}
    from "../controllers/address.controller";
import { addressSchema } from "../validator/user/user.config";
import { mongoIdSchema } from "../validator/common.config";

const router = Router();

router.patch("/:id", validate(mongoIdSchema, "params"), validate(addressSchema, "body"), updateAddressById);
router.delete("/:id", validate(mongoIdSchema, "params"), deleteAddressById);
router.patch("/:id/default", validate(mongoIdSchema, "params"), setDefaultAddressById);


export default router;