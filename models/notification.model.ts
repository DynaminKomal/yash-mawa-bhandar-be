import mongoose, { Model, Schema, Document } from "mongoose";

export interface INotification extends Document {
    title: string;
    message: string;
    type: "order" | "plant_visit" | "general";
    referenceId?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["order", "plant_visit", "general"],
            default: "general",
        },
        referenceId: { type: String },
        isRead: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

const Notification = (mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", notificationSchema)) as Model<INotification>;

export default Notification;
