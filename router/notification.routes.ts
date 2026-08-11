import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { tokenVerify } from "../utility/token-verify";

const router = Router();

router.get("/", tokenVerify, notificationController.getNotifications);
router.patch("/mark-read", tokenVerify, notificationController.markNotificationsAsRead);
router.delete("/:id", tokenVerify, notificationController.deleteNotification);

export default router;

