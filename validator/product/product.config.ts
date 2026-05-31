import { z } from "zod";
import { UnitType } from "../../types/unitType.enum";
import { UploadedFile } from "express-fileupload";

const imageSchema = z
    .custom<UploadedFile>((file) => !!file, {
        message: "Image is required",
    })
    .refine(
        (file) =>
            [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
            ].includes(file.mimetype),
        {
            message:
                "Only jpg, jpeg, png, webp images are allowed",
        }
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, {
        message: "Image size must be less than 2MB",
    });

export const createProductSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .min(1, "Name cannot be empty")
        .trim(),

    description: z
        .string()
        .optional(),

    category: z
        .string({ error: "Category is required" })
        .min(1, "Category code is required"),
    hsnCode: z
        .string({ error: "HSN Code is required" })
        .min(1, "HSN code is required"),
    gstRate: z.preprocess(
        (val) => {
            if (val === undefined || val === null || val === "") {
                return undefined;
            }
            return Number(val);
        },
        z.number({ error: "GST Rate is required" })
            .refine((val) => !isNaN(val), {
                message: "GST Rate must be a valid number",
            })
            .refine((val) => val >= 0, {
                message: "GST Rate cannot be negative",
            })
            .refine((val) => val <= 100, {
                message: "GST Rate cannot exceed 100",
            })
    ),

    price: z.preprocess(
        (val) => {
            if (val === undefined || val === null || val === "") return undefined;
            return Number(val);
        },
        z.number({ error: "Price is required" })
            .refine((val) => !isNaN(val), { message: "Price must be a valid number" })
            .refine((val) => val > 0, { message: "Price must be greater than 0" })
    ),
    unitType: z.enum([
        UnitType.KG,
        UnitType.PACK,
        UnitType.LITER,
    ], {
        message: "Unit type must be kg, pack, or liter",
    }),

    inStock: z
        .coerce.boolean()
        .optional(),

    isActive: z
        .coerce.boolean()
        .optional(),

}).strict();

export const updateProductSchema = z.object({
    name: z.string().min(1).trim().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().positive().optional()
    ),
    hsnCode: z
        .string()
        .min(1).optional(),
    gstRate: z.preprocess(
        (val) =>
            val === undefined || val === null || val === ""
                ? undefined
                : Number(val),
        z
            .number()
            .min(0, "GST Rate cannot be negative")
            .max(100, "GST Rate cannot exceed 100")
            .optional()
    ),
    image: imageSchema.optional(),
    unitType: z.enum([
        UnitType.KG,
        UnitType.PACK,
        UnitType.LITER,
    ], {
        message: "Unit type must be kg, pack, or liter",
    }),
    inStock: z.coerce.boolean().optional(),
    isActive: z.coerce.boolean().optional(),
}).partial().strict();

export const getProductListSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(6),
    search: z.string().optional(),
    category: z.string().optional(),
    sort: z.string().optional(),
}).strict();

export const idParamSchema = z.object({
    id: z.string().min(1),
});