import { Router } from 'express';
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import plantVisitRoutes from "./plantVisit.routes";
import contactRoutes from "./contact.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import addressRoutes from "./address.routes";
import cartRoutes from "./cart.routes";
import paymentRoutes from "./payment.routes";
import deliverySlotRoutes from "./deliverySlot.routes";

const router = Router();

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/book-plant", plantVisitRoutes);
router.use("/contact", contactRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/address", addressRoutes);
router.use("/cart", cartRoutes);
router.use("/payments", paymentRoutes);
router.use("/delivery-slots", deliverySlotRoutes);

export default router;