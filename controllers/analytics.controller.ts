import { Request, Response } from "express";
import { grasp, sendResponse } from "../utility/response-utility";
import * as analyticsService from "../services/analytics.service";

export const getDashboardAnalyticsController = grasp(
    async (req: Request, res: Response) => {
        const response = await analyticsService.getDashboardAnalyticsService();
        sendResponse(
            res,
            200,
            "success",
            "Dashboard analytics fetched successfully",
            response
        );
    }
);
