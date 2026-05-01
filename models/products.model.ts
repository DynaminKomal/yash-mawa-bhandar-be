import mongoose, { Schema, Document } from "mongoose";

export interface IVariant {
    name: string;          // e.g. "500ml", "1kg"
    price: number;
    stock: number;
}

export interface IProduct extends Document {
    name: string;
    description?: string;
    category: string;
    images: string[];
    variants: IVariant[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const variantSchema = new Schema<IVariant>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
    },
    { _id: false }
);

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
        },

        category: {
            type: String,
            required: true,
            // Example: "milk", "ghee", "paneer"
        },

        images: [
            {
                type: String,
            },
        ],

        variants: {
            type: [variantSchema],
            validate: [(val: IVariant[]) => val.length > 0, "At least one variant required"],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);