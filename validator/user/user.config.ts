import { z } from "zod";

export const createUserSchema = z.object({
    userName: z
        .string({ error: "Name is required" })
        .min(1, "Name cannot be empty")
        .trim(),

    phoneNumber: z
        .string({ error: "Phone Number is required" })
        .trim()
        .regex(/^\d{10}$/, "Phone Number must be exactly 10 digits"),
    email: z
        .string({ error: "Email is required" })
        .email("Invalid email format"),
    password: z
        .string({ error: "Password is required" })
        .trim()
        .min(1, "Password cannot be empty")
        .min(8, "Password must be at least 8 characters long")
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
            "Password must contain uppercase, lowercase, and a number"
        )
    ,
    deliveryAddress: z
        .string({ error: "Delivery Address is required" })
        .min(1, "Delivery Address cannot be empty"),
    role: z.string().optional(),

}).strict();