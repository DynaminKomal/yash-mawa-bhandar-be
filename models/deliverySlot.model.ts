import mongoose, { Model, Schema, Document } from "mongoose";

export interface IDeliverySlot extends Document {
    name: string;
    startTime: string;
    endTime: string;
    maxOrders: number;
    isActive: boolean;
    isDeleted?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const deliverySlotSchema = new Schema(
    {
        name: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        maxOrders: { type: Number, default: 100 },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

const DeliverySlot = (mongoose.models.DeliverySlot ||
    mongoose.model<IDeliverySlot>("DeliverySlot", deliverySlotSchema)) as Model<IDeliverySlot>;

export default DeliverySlot;
