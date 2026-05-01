import { Router } from "express";
import {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller";
import { validateCreateCategory } from "../validator/category/category-validator";

const router = Router();

router.post("/", validateCreateCategory, createCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;