import { grasp, sendResponse } from "../utility/response-utility";
import * as plantVisitService from "../services/plantVisit.service";
import { Request, Response } from "express";
import { sendAdminNotification } from "../utility/mail";

export const bookPlanVisit = grasp(async (req: Request, res: Response) => {

    const plantRequest = await plantVisitService.createPlantVisitRequest(req.validatedBody);
    await sendAdminNotification(plantRequest);
    sendResponse(res, 201, "success", "Book Plant Visit created", plantRequest);
});
