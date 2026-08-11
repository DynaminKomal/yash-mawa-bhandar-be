import { Router } from "express";
import {
    createDeliverySlot,
    getAllDeliverySlots,
    updateDeliverySlot,
    toggleDeliverySlotStatus,
    deleteDeliverySlot,
} from "../controllers/deliverySlot.controller";

const router = Router();

router.post("/", createDeliverySlot);
router.get("/", getAllDeliverySlots);
router.put("/:id", updateDeliverySlot);
router.patch("/:id/toggle", toggleDeliverySlotStatus);
router.delete("/:id", deleteDeliverySlot);

export default router;
