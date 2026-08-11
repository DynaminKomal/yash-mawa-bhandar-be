import { Request, Response } from "express";
import { grasp, sendResponse } from "../utility/response-utility";
import Notification from "../models/notification.model";

export const getNotifications = grasp(async (req: Request, res: Response) => {
    const { all, isRead, type, search, page = 1, limit = 20 } = req.query;

    const filter: Record<string, any> = {};

    if (all === "true" || all === "1") {
        // Fetch all (read & unread)
        if (isRead !== undefined && isRead !== "") {
            filter.isRead = isRead === "true" || isRead === "1";
        }
    } else if (isRead !== undefined && isRead !== "") {
        filter.isRead = isRead === "true" || isRead === "1";
    } else {
        // Default dropdown behavior: fetch unread only
        filter.isRead = false;
    }

    if (type && type !== "all" && typeof type === "string") {
        filter.type = type;
    }

    if (search && typeof search === "string" && search.trim()) {
        filter.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { message: { $regex: search.trim(), $options: "i" } },
        ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount, totalCount, orderCount, plantVisitCount] = await Promise.all([
        Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Notification.countDocuments(filter),
        Notification.countDocuments({ isRead: false }),
        Notification.countDocuments({}),
        Notification.countDocuments({ type: "order" }),
        Notification.countDocuments({ type: "plant_visit" }),
    ]);

    sendResponse(res, 200, "success", "Notifications fetched successfully", {
        notifications,
        unreadCount,
        totalCount,
        orderCount,
        plantVisitCount,
        pagination: {
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            limit: limitNum,
        },
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

export const deleteNotification = grasp(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (id === "all") {
        await Notification.deleteMany({});
    } else {
        await Notification.findByIdAndDelete(id);
    }

    sendResponse(res, 200, "success", "Notification deleted successfully", null);
});
