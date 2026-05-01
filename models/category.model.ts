import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    code: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        description: {
            type: String,
        },

        image: {
            type: String,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<ICategory>("Category", categorySchema);