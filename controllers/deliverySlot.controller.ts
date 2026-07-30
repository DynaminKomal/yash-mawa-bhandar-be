import { grasp, sendResponse } from "../utility/response-utility";
import * as deliverySlotService from "../services/deliverySlot.service";
import { Request, Response } from "express";
import { IdParams } from "../types/request.types";

export const createDeliverySlot = grasp(async (req: Request, res: Response) => {
    const { name, startTime, endTime } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 3) {
        return sendResponse(res, 400, "fail", "Please provide a valid slot name (at least 3 characters).");
    }
    if (/^[a-zA-Z]{1,2}$/.test(name.trim()) || /^[^a-zA-Z0-9]+$/.test(name.trim())) {
        return sendResponse(res, 400, "fail", "Please provide a meaningful slot name.");
    }
    if (!startTime || !endTime) {
        return sendResponse(res, 400, "fail", "Start time and end time are required.");
    }
    const slot = await deliverySlotService.createDeliverySlot(req.body);
    sendResponse(res, 201, "success", "Delivery slot created successfully", slot);
});

export const getAllDeliverySlots = grasp(async (req: Request, res: Response) => {
    const slots = await deliverySlotService.getAllDeliverySlots(req.query);
    sendResponse(res, 200, "success", "Delivery slots fetched successfully", slots);
});

export const updateDeliverySlot = grasp(async (req: Request<IdParams>, res: Response) => {
    const { id } = req.params;
    const { name, startTime, endTime } = req.body;

    if (name !== undefined) {
        if (!name || typeof name !== "string" || name.trim().length < 3) {
            return sendResponse(res, 400, "fail", "Please provide a valid slot name (at least 3 characters).");
        }
    }

    const slot = await deliverySlotService.updateDeliverySlot(id, req.body);
    sendResponse(res, 200, "success", "Delivery slot updated successfully", slot);
});

export const toggleDeliverySlotStatus = grasp(async (req: Request<IdParams>, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const slot = await deliverySlotService.toggleDeliverySlotStatus(id, isActive);
    sendResponse(res, 200, "success", "Delivery slot status updated successfully", slot);
});

export const deleteDeliverySlot = grasp(async (req: Request<IdParams>, res: Response) => {
    const { id } = req.params;
    const slot = await deliverySlotService.softDeleteDeliverySlot(id);
    sendResponse(res, 200, "success", "Delivery slot deleted successfully", slot);
});
