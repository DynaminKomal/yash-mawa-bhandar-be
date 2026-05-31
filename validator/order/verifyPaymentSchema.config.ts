import { z } from "zod";

export const getOrderSchema = z
    .object({
        page: z.coerce
            .number()
            .positive()
            .optional(),

        limit: z.coerce
            .number()
            .positive()
            .optional(),

        search: z.string()
            .trim()
            .optional(),

        orderStatus: z.string()
            .trim()
            .optional(),
        paymentMethod: z.string()
            .trim()
            .optional(),

        paymentStatus: z.string()
            .trim()
            .optional()
    })



export const cancelBodySchema = z.object({
    cancelReason: z
        .string({ error: "Reason is required" })
        .min(1, "Reason cannot be empty")
        .trim()
}).strict();