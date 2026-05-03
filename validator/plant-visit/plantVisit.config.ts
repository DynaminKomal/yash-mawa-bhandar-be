import { z } from "zod";

export const createPlantVisit = z.object({
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

    company: z
        .string({ error: "Company is required" })
        .min(1, "Company cannot be empty"),

    date: z
        .string({ error: "Visiting Date is required" })
        .min(1, "Visiting Date is required")
        .transform((val) => new Date(val)),

    numberVisitor: z.preprocess(
        (val) => Number(val),
        z.number({ error: "Number of visitors is required" })
            .int("Must be an integer")
            .positive("Must be greater than 0")
    ),

    message: z
        .string({ error: "Message is required" })
        .min(1, "Message cannot be empty"),

    // optional fields
    notes: z.string().optional(),
}).strict();