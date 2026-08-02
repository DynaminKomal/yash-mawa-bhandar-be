import { Router } from "express";
import { getDashboardAnalyticsController } from "../controllers/analytics.controller";
import { optionalTokenVerify } from "../utility/token-verify";

const router = Router();

router.get("/dashboard", optionalTokenVerify, getDashboardAnalyticsController);

export default router;
