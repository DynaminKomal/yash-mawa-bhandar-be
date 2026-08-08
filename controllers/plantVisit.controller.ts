import { grasp, sendResponse } from "../utility/response-utility";
import * as plantVisitService from "../services/plantVisit.service";
import { Request, Response } from "express";
import { IdParams } from "../types/request.types";
import { sendAdminNotification, sendPlantVisitStatusEmail } from "../utility/mail";
import Notification from "../models/notification.model";
import { sendAdminFCMNotification } from "../utility/fcm";

export const bookPlanVisit = grasp(async (req: Request, res: Response) => {
    const plantRequest = await plantVisitService.createPlantVisitRequest(req.validatedBody);
    await sendAdminNotification(plantRequest);

    // Create Notification in DB for Admin Portal
    try {
        await Notification.create({
            title: "New Plant Visit Request",
            message: `New visit request from ${plantRequest.userName} (${plantRequest.company}) for ${plantRequest.numberVisitor} visitor(s).`,
            type: "plant_visit",
            referenceId: plantRequest._id ? plantRequest._id.toString() : plantRequest.visitId,
        });

        // Send FCM Push Notification to Admin devices
        await sendAdminFCMNotification({
            title: "🌱 New Plant Visit Request",
            body: `New visit request from ${plantRequest.userName} (${plantRequest.company}) for ${plantRequest.numberVisitor} visitor(s).`,
            data: {
                visitId: plantRequest._id ? plantRequest._id.toString() : plantRequest.visitId,
                type: "plant_visit",
            },
        });
    } catch (err) {
        console.error("Error creating/sending Notification for plant visit:", err);
    }

    sendResponse(res, 201, "success", "Book Plant Visit created", plantRequest);
});

export const getAllPlantVisits = grasp(async (req: Request, res: Response) => {
    const visits = await plantVisitService.getAllPlantVisitRequests(req.query);
    sendResponse(res, 200, "success", "Plant visits fetched successfully", visits);
});

export const updatePlantVisitStatus = grasp(async (req: Request<IdParams>, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
        return sendResponse(res, 400, "fail", "Invalid status. Must be 'approved' or 'rejected'.");
    }

    if (!notes || !notes.trim()) {
        return sendResponse(res, 400, "fail", "Reason or notes is mandatory when approving or rejecting a plant visit request.");
    }

    const updatedVisit = await plantVisitService.updatePlantVisitStatus(id, status, notes);

    // Send email notification to user on status update
    await sendPlantVisitStatusEmail(updatedVisit, status, notes);

    sendResponse(res, 200, "success", `Plant visit ${status} successfully`, updatedVisit);
});

export const softDeletePlantVisit = grasp(async (req: Request<IdParams>, res: Response) => {
    const { id } = req.params;
    const deletedVisit = await plantVisitService.softDeletePlantVisitRequest(id);
    sendResponse(res, 200, "success", "Plant visit deleted successfully", deletedVisit);
});

