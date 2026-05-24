import { z } from "zod";
import { UnitType } from "../../types/unitType.enum";

export const createCartSchema = z.object({
    item: z.object({
        product: z.string().regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid product ObjectId"
        ),
        quantity: z.number().int().positive("Quantity must be > 0"),
        price: z.number().nonnegative("Price must be >= 0"),
        unitType: z.enum([
            UnitType.KG,
            UnitType.PACK,
            UnitType.LITER,
        ], {
            message: "Unit type must be kg, pack, or liter",
        }),
    }),

}).strict();


export const updateCartSchema = z.object({
    productId: z.string().regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid product ObjectId"
    ),
    quantity: z.number().int().nonnegative("Quantity cannot be negative")

}).strict();

export const deleteCartParams = z.object({
    productId: z.string().regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid product ObjectId"
    )
}).strict();