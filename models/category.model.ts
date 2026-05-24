import mongoose, { Model, Schema, Document } from "mongoose";
export interface ICategory extends Document {
    name: string;
    code?: string;
    description?: string;
    image?: string;
    isActive: boolean;
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
            unique: true,
            lowercase: true,
        },
        description: String,
        image: String,

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

categorySchema.pre("save", async function (this: ICategory) {
    if (!this.code && this.name) {
        this.code = this.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    }
});

const Category = (mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)) as Model<ICategory>;
export default Category;