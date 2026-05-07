import { Router } from "express";
import { validate } from "../validator/validate";
import { createUser } from "../controllers/auth.controller";
import { createUserSchema } from "../validator/user/user.config";

const router = Router();

router.post("/sign-up", validate(createUserSchema, "body"), createUser);


export default router;