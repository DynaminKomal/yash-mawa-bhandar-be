import { Router } from "express";
import {
    bookPlanVisit,
    getAllPlantVisits,
    updatePlantVisitStatus,
    softDeletePlantVisit,
} from "../controllers/plantVisit.controller";
import { validate } from "../validator/validate";
import { createPlantVisit } from "../validator/plant-visit/plantVisit.config";

const router = Router();

router.post("/create-plant-visit-request", validate(createPlantVisit, "body"), bookPlanVisit);
router.get("/list", getAllPlantVisits);
router.patch("/:id/status", updatePlantVisitStatus);
router.delete("/:id", softDeletePlantVisit);

export default router;