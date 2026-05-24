import crypto from "crypto";

import { razorpayInstance } from "../utility/razorpay";

import Cart from "../models/cart.model";

import Order from "../models/order.model";

import {
    orderStatusEnum,
    paymentMethodEnum,
    paymentStatusEnum,
} from "../types/order.enum";

export const createRazorpayOrderService =
    async (amount: number) => {

        const options = {
            amount: amount * 100,

            currency: "INR",

            receipt:
                `receipt_${Date.now()}`,
        };

        return await razorpayInstance
            .orders
            .create(options);
    };

export const verifyPaymentService =
    async (data: any) => {

        try {

            const {

                razorpay_order_id,

                razorpay_payment_id,

                razorpay_signature,

                deliveryAddress,

                deliverySlot,

                paymentMethod,

                user,

            } = data;

            const cart =
                await Cart.findOne({
                    user,
                }).populate(
                    "items.product"
                );

            if (!cart) {
                throw new Error(
                    "Cart not found"
                );
            }

            if (!cart.items.length) {
                throw new Error(
                    "Cart is empty"
                );
            }

            let paymentStatus =
                paymentStatusEnum.PENDING;

            /*
            ONLINE PAYMENT
            */

            if (
                paymentMethod ===
                paymentMethodEnum.UPI
            ) {

                const generatedSignature =
                    crypto
                        .createHmac(
                            "sha256",
                            process.env
                                .RAZORPAY_SECRET!
                        )
                        .update(
                            razorpay_order_id +
                            "|" +
                            razorpay_payment_id
                        )
                        .digest("hex");

                const isAuthentic =
                    generatedSignature ===
                    razorpay_signature;

                if (!isAuthentic) {
                    throw new Error(
                        "Invalid payment signature"
                    );
                }

                paymentStatus =
                    paymentStatusEnum.PAID;
            }

            /*
            CALCULATIONS
            */

            const subtotal =
                cart.totalAmount;

            const gstAmount =
                subtotal * 0.05;

            const shippingCharge =
                subtotal > 500
                    ? 0
                    : 40;

            const finalAmount =
                subtotal +
                gstAmount +
                shippingCharge;

            /*
            ORDER ITEMS
            */

            const items =
                cart.items.map(
                    (item: any) => ({

                        product:
                            item.product._id,

                        name:
                            item.product.name,

                        image:
                            item.product
                                .images?.[0] || "",

                        quantity:
                            item.quantity,

                        unitType:
                            item.unitType,

                        price:
                            item.price,

                        totalPrice:
                            item.quantity *
                            item.price,
                    })
                );

            /*
            CREATE ORDER
            */

            const order =
                await Order.create({

                    user,

                    items,

                    deliveryAddress,
                    deliverySlot: {
                        date: deliverySlot.date,
                        time: deliverySlot.time
                    },

                    subtotal,

                    gstAmount,

                    shippingCharge,

                    finalAmount,

                    paymentMethod,

                    paymentStatus,

                    orderStatus:
                        paymentMethod ===
                            paymentMethodEnum.COD
                            ? orderStatusEnum.PENDING
                            : orderStatusEnum.CONFIRMED,

                    razorpayOrderId:
                        razorpay_order_id || "",

                    razorpayPaymentId:
                        razorpay_payment_id || "",

                    razorpaySignature:
                        razorpay_signature || "",

                    transactionId:
                        razorpay_payment_id || ""
                });

            /*
            CLEAR CART
            */

            await Cart.findOneAndUpdate(
                { user },
                {
                    items: [],
                    totalAmount: 0,
                }
            );

            return order;

        } catch (error) {
            throw error;
        }
    };