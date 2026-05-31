import mongoose, { Model, Schema, Document } from "mongoose";
import { UnitType } from "../types/unitType.enum";

export interface IProduct extends Document {
    name: string;
    code: string;
    description?: string;
    category: mongoose.Types.ObjectId;
    images: string[];
    price: number;
    unitType: UnitType;
    inStock: boolean;
    hsnCode: string;
    gstRate: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            unique: true,
            lowercase: true,
        },

        description: String,

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        unitType: {
            type: String,
            enum: Object.values(UnitType),
            default: UnitType.KG,
        },
        images: [String],
        price: {
            type: Number,
            required: true,
        },
        hsnCode: {
            type: String,
            required: true,
            trim: true,
        },

        gstRate: {
            type: Number,
            required: true,
            default: 0,
        },
        inStock: {
            type: Boolean,
            default: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

productSchema.pre("save", function () {
    if (!this.code && this.name) {
        this.code = this.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    }
});

const Product = (mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)) as Model<IProduct>;
export default Product;