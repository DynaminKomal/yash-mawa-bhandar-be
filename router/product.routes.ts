import { Router } from 'express';
import { validateCreateProduct } from '../validator/product/product-validator';
import { createProductController, getProducts } from '../controllers/product.controller';

const router = Router();

router.post("/create-product", validateCreateProduct, createProductController);


export default router;