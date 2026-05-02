import { grasp, sendResponse } from "../utility/response-utility";
import * as productService from "../services/product.service";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import Product from '../models/products.model';
import { UploadedFile } from "express-fileupload";

export const createProductController = grasp(async (req: any, res: Response) => {

    const processedData = await productService.createProduct({
        ...req.validatedBody,
    });

    let imageUrls: string[] = [];

    if (req.files && req.files.image) {
        const files: UploadedFile[] = Array.isArray(req.files.image)
            ? req.files.image
            : [req.files.image];

        const uploads = await Promise.all(
            files.map((file: UploadedFile) =>
                cloudinary.uploader.upload(file.tempFilePath, {
                    folder: "yash-mawa-bhandar/products",
                    public_id: file.name.replace(/\.(jpg|jpeg|png)$/, ""),
                })
            )
        );

        imageUrls = uploads.map((img) => img.secure_url);
        console.log('imageUrls', imageUrls)
    }

    const product = await Product.create({
        ...processedData,
        images: imageUrls,
    });

    sendResponse(res, 201, "success", "Product created", product);
});

export const getProducts = grasp(async (req, res) => {
    const productList = await productService.getAllProducts();
    sendResponse(res, 200, "success", "products fetched", productList);
});
