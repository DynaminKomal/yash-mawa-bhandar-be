import { grasp, sendResponse } from "../utility/response-utility";
import * as productService from "../services/product.service";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import Product from '../models/products.model';
import { UploadedFile } from "express-fileupload";
import { IdParams } from "../types/request.types";

export const createProductController = grasp(async (req: Request, res: Response) => {

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

export const getProductList = grasp(async (req: Request, res) => {
    const productList = await productService.getAllProducts(req.validatedQuery);
    sendResponse(res, 200, "success", "products list fetched", productList);
});



export const getProduct = grasp(async (req: Request<IdParams>, res) => {
    const { id } = req.validatedParams;
    const product = await productService.getProductById(id);

    sendResponse(res, 200, "success", "Product fetched", product);
});

export const updateProduct = grasp(
    async (req: Request<IdParams>, res: Response) => {
        const { id } = req.validatedParams;

        const existingProduct = await Product.findById(id);

        if (!existingProduct) {
            throw new Error("Product not found");
        }

        let imageUrls: string[] | undefined;

        if (req.files && req.files.image) {
            const files: UploadedFile[] = Array.isArray(req.files.image)
                ? req.files.image
                : [req.files.image];

            if (existingProduct.images?.length) {
                await Promise.all(
                    existingProduct.images.map((url) => {
                        const publicId = extractPublicId(url);

                        return cloudinary.uploader.destroy(publicId);
                    })
                );
            }

            const uploads = await Promise.all(
                files.map((file: UploadedFile) =>
                    cloudinary.uploader.upload(file.tempFilePath, {
                        folder: "yash-mawa-bhandar/products",
                        public_id: file.name
                            .replace(/\.(jpg|jpeg|png)$/i, ""),
                    })
                )
            );

            imageUrls = uploads.map((img) => img.secure_url);
        }

        const updateData: any = {
            ...req.validatedBody,
        };

        if (imageUrls) {
            updateData.images = imageUrls;
        }

        const product = await productService.updateProductById(
            id,
            updateData
        );

        sendResponse(res, 200, "success", "Product updated", product);
    }
);

const extractPublicId = (url: string) => {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];

    return `yash-mawa-bhandar/products/${fileName.split(".")[0]}`;
};

export const deleteProduct = grasp(async (req: Request<IdParams>, res) => {
    const { id } = req.validatedParams;
    const product = await productService.deleteProductById(id);
    sendResponse(res, 200, "success", "Product deleted", product);
});