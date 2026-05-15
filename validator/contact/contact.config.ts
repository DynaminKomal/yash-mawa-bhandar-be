import { z } from "zod";

export const createContactSchema = z.object({
    userName: z
        .string({ error: "Name is required" })
        .min(1, "Name cannot be empty")
        .trim(),

    phoneNumber: z
        .string({ error: "Phone Number is required" })
        .min(1, "Phone Number cannot be empty"),

    email: z
        .string({ error: "Email is required" })
        .email("Invalid email format"),

    deliveryArea: z
        .string({ error: "Delivery Area is required" })
        .min(1, "Delivery Area cannot be empty"),
    subject: z
        .string({ error: "Subject is required" })
        .min(1, "Subject cannot be empty"),
    message: z
        .string({ error: "Message is required" })
        .min(1, "Message cannot be empty"),
    rating: z.number().optional(),
}).strict();


export const contactQuerySchema = z.object({
    subject: z
        .string()
        .optional(),

    rating: z
        .string()
        .optional(),

    page: z
        .string()
        .regex(/^\d+$/, "Page must be a number")
        .optional(),

    limit: z
        .string()
        .regex(/^\d+$/, "Limit must be a number")
        .optional(),
}).strict();