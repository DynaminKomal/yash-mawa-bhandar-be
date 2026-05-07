import { Router } from "express";
import { validate } from "../validator/validate";
import { createUser, login } from "../controllers/auth.controller";
import { createUserSchema, loginSchema } from "../validator/user/user.config";

const router = Router();

router.post("/sign-up", validate(createUserSchema, "body"), createUser);
router.post("/sign-in", validate(loginSchema, "body"), login);


export default router;