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