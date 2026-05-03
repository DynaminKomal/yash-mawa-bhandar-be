import { grasp, sendResponse } from "../utility/response-utility";
import * as contactService from "../services/contact.service";
import { Request, Response } from "express";

export const createContactController = grasp(async (req: Request, res: Response) => {

    const contact = await contactService.createContact(req.validatedBody);

    sendResponse(res, 201, "success", "Contact created successfully", contact);
});
