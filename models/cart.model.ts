import mongoose, { Document, Schema } from "mongoose";
import { UnitType } from "../types/unitType.enum";

export interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    unitType: UnitType;
    price: number;
}

export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        unitType: {
            type: String,
            enum: Object.values(UnitType),
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        items: [cartItemSchema],

        totalAmount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Cart ||
    mongoose.model<ICart>("Cart", cartSchema);