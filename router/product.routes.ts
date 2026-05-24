import { Router } from 'express';
import { validate } from '../validator/validate';
import { createProductController, getProductList, getProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { createProductSchema, getProductListSchema, idParamSchema, updateProductSchema } from '../validator/product/product.config';

const router = Router();


router.post(
    "/create-product",
    validate(createProductSchema, "body"),
    createProductController
);

router.get(
    "/",
    validate(getProductListSchema, "query"),
    getProductList
);

router.get(
    "/:id",
    validate(idParamSchema, "params"),
    getProduct
);

router.put(
    "/:id",
    validate(idParamSchema, "params"),
    validate(updateProductSchema, "body", false),
    updateProduct
);

router.delete(
    "/:id",
    validate(idParamSchema, "params"),
    deleteProduct
);

export default router;
