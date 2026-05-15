import mongoose, { Document, Schema } from "mongoose";
import { orderStatusEnum, paymentMethodEnum, paymentStatusEnum } from "../types/order.enum";

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    cartId: mongoose.Types.ObjectId;
    deliveryAddress: mongoose.Types.ObjectId;
    deliveryDate: string;
    deliveryTimeSlot: string;

    subtotal: number;
    gstAmount: number;
    shippingCharge: number;
    finalAmount: number;
    paymentMethod: paymentMethodEnum;
    paymentStatus: paymentStatusEnum;

    orderStatus: orderStatusEnum;
}


const paymentMethodValues = Object.values(paymentMethodEnum).filter(
    (v) => typeof v === "number"
);

const paymentStatusValues = Object.values(paymentStatusEnum).filter(
    (v) => typeof v === "number"
);

const orderStatusdValues = Object.values(orderStatusEnum).filter(
    (v) => typeof v === "number"
);
const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cartId: {
            type: Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },

        deliveryAddress: {
            type: Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },

        deliveryDate: {
            type: String,
            required: true,
        },

        deliveryTimeSlot: {
            type: String,
            required: true,
        },

        subtotal: {
            type: Number,
            required: true,
        },

        gstAmount: {
            type: Number,
            default: 0,
        },

        shippingCharge: {
            type: Number,
            default: 0,
        },

        finalAmount: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: Number,
            enum: paymentMethodValues,
            default: paymentMethodEnum.COD,
        },

        paymentStatus: {
            type: Number,
            enum: paymentStatusValues,
            default: paymentStatusEnum.PENDING,
        },

        orderStatus: {
            type: Number,
            enum: orderStatusdValues,
            default: orderStatusEnum.PENDING,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Order ||
    mongoose.model<IOrder>("Order", orderSchema);