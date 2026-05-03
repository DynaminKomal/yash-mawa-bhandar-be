import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
    userName: string;
    phoneNumber: string;
    email: string;
    deliveryArea: string;
    subject: string;
    message: string;
    rating?: string;
    createdAt: Date;
    updatedAt: Date;
}

const contactSchema = new Schema(
    {
        userName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true },
        deliveryArea: { type: String, required: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        rating: String,
    },
    { timestamps: true }
);


export default mongoose.model<IContact>("Contact", contactSchema);