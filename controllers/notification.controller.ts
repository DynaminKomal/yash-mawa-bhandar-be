import { Request, Response } from "express";
import { grasp, sendResponse } from "../utility/response-utility";
import Notification from "../models/notification.model";

export const getNotifications = grasp(async (req: Request, res: Response) => {
    const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(30);

    const unreadCount = await Notification.countDocuments({ isRead: false });

    sendResponse(res, 200, "success", "Notifications fetched successfully", {
        notifications,
        unreadCount,
    });
});

export const markNotificationsAsRead = grasp(async (req: Request, res: Response) => {
    const { id } = req.body;

    if (id) {
        await Notification.findByIdAndUpdate(id, { isRead: true });
    } else {
        await Notification.updateMany({ isRead: false }, { isRead: true });
    }

    sendResponse(res, 200, "success", "Notifications marked as read", null);
});
