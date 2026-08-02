import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { tokenVerify } from "../utility/token-verify";

const router = Router();

router.get("/", tokenVerify, notificationController.getNotifications);
router.patch("/mark-read", tokenVerify, notificationController.markNotificationsAsRead);

export default router;

