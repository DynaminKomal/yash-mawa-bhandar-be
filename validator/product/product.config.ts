import { z } from "zod";

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

    price: z.preprocess(
        (val) => {
            if (val === undefined || val === null || val === "") return undefined;
            return Number(val);
        },
        z.number({ error: "Price is required" })
            .refine((val) => !isNaN(val), { message: "Price must be a valid number" })
            .refine((val) => val > 0, { message: "Price must be greater than 0" })
    ),

    inStock: z
        .coerce.boolean()
        .optional(),

    isActive: z
        .coerce.boolean()
        .optional(),

}).strict();