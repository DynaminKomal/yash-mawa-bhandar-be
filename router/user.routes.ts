import { Router } from "express";
import { validate } from "../validator/validate";
import { addNewAddress, getAllAddressBYId, } from "../controllers/address.controller";
import { createNewAddress, updateUserSchema } from "../validator/user/user.config";
import { mongoIdSchema } from "../validator/common.config";
import { tokenVerify } from "../utility/token-verify";
import { deactivateUserController, getUserProfileController, updateUserProfileController } from "../controllers/user.controller";

const router = Router();

router.post("/:id/addresses", validate(mongoIdSchema, "params"), validate(createNewAddress, "body"), addNewAddress);
router.get("/:id/addresses", validate(mongoIdSchema, "params"), getAllAddressBYId);

router.use(tokenVerify)
router.put("/update-profile", validate(updateUserSchema, "body", false), updateUserProfileController);
router.get("/get-profile", getUserProfileController);
router.delete("/deactivate-profile", deactivateUserController);


export default router;