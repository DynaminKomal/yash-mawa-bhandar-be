import { Router } from "express";
import { validate } from "../validator/validate";
import { addNewAddress, deleteAddressById, getAllAddressBYId, setDefaultAddressById, updateAddressById } from "../controllers/address.controller";
import { addressSchema } from "../validator/user/user.config";
import { mongoIdSchema } from "../validator/common.config";

const router = Router();

router.post("/:id/addresses", validate(mongoIdSchema, "params"), validate(addressSchema, "body"), addNewAddress);
router.get("/:id/addresses", validate(mongoIdSchema, "params"), getAllAddressBYId);


export default router;