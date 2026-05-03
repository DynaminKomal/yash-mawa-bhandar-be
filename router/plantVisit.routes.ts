import { Router } from "express";
import { bookPlanVisit } from "../controllers/plantVisit.controller";
import { validate } from "../validator/validate";
import { createPlantVisit } from "../validator/plant-visit/plantVisit.config";

const router = Router();

router.post("/create-plant-visit-request", validate(createPlantVisit, "body"), bookPlanVisit);


export default router;