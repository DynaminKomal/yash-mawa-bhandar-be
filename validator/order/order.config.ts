import { z } from "zod";
import {
    orderStatusEnum,
    paymentMethodEnum,
    paymentStatusEnum,
} from "../../types/order.enum";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createOrderSchema = z
    .object({
        user: z
            .string()
            .regex(objectIdRegex, "Invalid user id"),

        cartId: z
            .string()
            .regex(objectIdRegex, "Invalid cart id"),

        deliveryAddress: z
            .string()
            .regex(objectIdRegex, "Invalid delivery address id"),

        deliveryDate: z
            .string()
            .min(1, "Delivery date is required"),

        deliveryTimeSlot: z
            .string()
            .min(1, "Delivery time slot is required"),

        subtotal: z
            .number({
                error: "Subtotal is required",
            })
            .min(0, "Subtotal cannot be negative"),

        gstAmount: z
            .number({
                error: "GST amount must be a number",
            })
            .min(0, "GST amount cannot be negative")
            .default(0),

        shippingCharge: z
            .number({
                error: "Shipping charge must be a number",
            })
            .min(0, "Shipping charge cannot be negative")
            .default(0),

        finalAmount: z
            .number({
                error: "Final amount is required",
            })
            .min(0, "Final amount cannot be negative"),

        paymentMethod: z
            .nativeEnum(paymentMethodEnum)
            .default(paymentMethodEnum.COD),

        paymentStatus: z
            .nativeEnum(paymentStatusEnum)
            .default(paymentStatusEnum.PENDING),

        orderStatus: z
            .nativeEnum(orderStatusEnum)
            .default(orderStatusEnum.PENDING),
    })
    .strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;