import { Router } from "express";
import { validate } from "../validator/validate";
import { createContactController } from "../controllers/contact.controller";
import { createContactSchema } from "../validator/contact/contact.config";

const router = Router();

router.post("/create-feedback", validate(createContactSchema, "body"), createContactController);


export default router;