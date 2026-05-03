import { Router } from 'express';
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import plantVisitRoutes from "./plantVisit.routes";
import contactRoutes from "./contact.routes";

const router = Router();

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/book-plant", plantVisitRoutes);
router.use("/contact", contactRoutes);

export default router;