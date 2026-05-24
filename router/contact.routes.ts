import { Router } from "express";
import { validate } from "../validator/validate";
import { createContactController, getContactController } from "../controllers/contact.controller";
import { contactQuerySchema, createContactSchema } from "../validator/contact/contact.config";

const router = Router();

router.post("/create-feedback", validate(createContactSchema, "body"), createContactController);
router.get("/list", validate(contactQuerySchema, "query"), getContactController);


export default router;