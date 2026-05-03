import * as categoryService from "../services/category.service";
import { IdParams } from "../types/request.types";
import { grasp, sendResponse } from "../utility/response-utility";
import { Request } from "express";

export const createCategory = grasp(async (req, res) => {
    const category = await categoryService.createCategory(req.validatedBody);

    sendResponse(res, 201, "success", "Category created", category);
});

export const getCategories = grasp(async (req, res) => {
    const categories = await categoryService.getAllCategories();

    sendResponse(res, 200, "success", "Categories fetched", categories);
});

export const getCategory = grasp(async (req: Request<IdParams>, res) => {
    const category = await categoryService.getCategoryById(req.params.id);

    sendResponse(res, 200, "success", "Category fetched", category);
});

export const updateCategory = grasp(async (req: Request<IdParams>, res) => {
    const category = await categoryService.updateCategory(
        req.params.id,
        req.body
    );

    sendResponse(res, 200, "success", "Category updated", category);
});

export const deleteCategory = grasp(async (req: Request<IdParams>, res) => {
    const category = await categoryService.deleteCategory(req.params.id);
    sendResponse(res, 200, "success", "Category deleted", category);
});