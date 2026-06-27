import mongoose, { Model, Document, Schema } from "mongoose";
import {
    orderStatusEnum,
    paymentMethodEnum,
    paymentStatusEnum,
} from "../types/order.enum";

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    image: string;
    quantity: number;
    unitType: string;
    price: number;
    totalPrice: number;
    hsnCode?: string;
    gstRate?: number;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    deliveryAddress: mongoose.Types.ObjectId;
    deliverySlot: {
        date: string;
        time: string;
    };
    subtotal: number;
    gstAmount: number;
    shippingCharge: number;
    finalAmount: number;
    paymentMethod: paymentMethodEnum;
    paymentStatus: paymentStatusEnum;
    orderStatus: orderStatusEnum;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    invoiceUrl?: string;
    invoicePublicId?: string;
    createdAt?: Date,
    updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: String,
                image: String,
                quantity: Number,
                unitType: String,
                price: Number,
                totalPrice: Number,
                hsnCode: String,
                gstRate: Number,
            },
        ],
        deliveryAddress: {
            type: Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },
        deliverySlot: {
            date: String,
            time: String,
        },
        subtotal: Number,
        gstAmount: Number,
        shippingCharge: Number,
        finalAmount: Number,
        paymentMethod: Number,
        paymentStatus: Number,
        orderStatus: Number,
        transactionId: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        paidAt: Date,
        deliveredAt: Date,
        cancelledAt: Date,
        cancelReason: String,
        invoiceUrl: String,
        invoicePublicId: String,
    },
    {
        timestamps: true,
    }
);


const Order = (mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema)) as Model<IOrder>;
export default Order;