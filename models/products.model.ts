import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    code: string;
    description?: string;
    category: mongoose.Types.ObjectId;
    images: string[];
    price: number;
    inStock: boolean;
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

        images: [String],

        price: {
            type: Number,
            required: true,
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


productSchema.pre("save", function (this: IProduct) {
    if (!this.code && this.name) {
        this.code = this.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    }
});

export default mongoose.model<IProduct>("Product", productSchema);