import { z } from "zod";

export const addressSchema = z.object({
    addressLine1: z
        .string()
        .trim()
        .min(3, "Address Line 1 is required"),

    addressLine2: z
        .string()
        .trim()
        .optional(),

    city: z
        .string()
        .trim()
        .min(2, "City is required"),

    state: z
        .string()
        .trim()
        .min(2, "State is required"),

    pincode: z
        .string()
        .trim()
        .regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),

    landmark: z
        .string()
        .trim()
        .optional(),

    addressType: z.enum(["home", "work", "other"]).optional(),
});

export const createNewAddress = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters"),

    phoneNumber: z
        .string()
        .trim()
        .regex(/^\d{10}$/, "Phone Number must be exactly 10 digits"),

    address: z.object(addressSchema.shape, {
        error: "Address is required",
    }),

}).strict();

export const createUserSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters"),

    phoneNumber: z
        .string()
        .trim()
        .regex(/^\d{10}$/, "Phone Number must be exactly 10 digits"),

    email: z
        .string()
        .trim()
        .email("Invalid email format"),

    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters long")
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
            "Password must contain uppercase, lowercase, and a number"
        ),

    address: z.object(addressSchema.shape, {
        error: "Address is required",
    }),

    role: z
        .enum(["customer", "admin"])
        .optional(),
}).strict();

export type ICreateUser = z.infer<typeof createUserSchema>;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email or phone is required")
        .refine(
            (val) => emailRegex.test(val) || phoneRegex.test(val),
            {
                message: "Enter valid email or 10-digit phone number",
            }
        ),

    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters long")
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
            "Password must contain uppercase, lowercase, and a number"
        ),
}).strict();

export type ILogin = z.infer<typeof loginSchema>;

export const updateUserSchema = z.object({
    userName: z.string().min(3).trim().optional(),
    email: z.string().optional(),
    profile: z.string().optional(),
    gender: z.enum(["male", "female", "other"], {
        message: "Gender must be male, female, or other",
    }),
    dateOfBirth: z.coerce.date().optional(),
}).partial().strict();

export const passwordSchema = z
    .object({
        oldPassword: z.string().min(8, "Old password required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
    }).strict();