import crypto from "crypto";
import { razorpayInstance } from "../utility/razorpay";
import Cart from "../models/cart.model";
import Order from "../models/order.model";
import { generateInvoicePdf } from "./invoice.service";

import {
    orderStatusEnum,
    paymentMethodEnum,
    paymentStatusEnum,
} from "../types/order.enum";
import { GetOrdersParams } from "../types/payment.type";

export const createRazorpayOrderService =
    async (amount: number) => {

        const options = {
            amount:
                Math.round(amount * 100),
            currency:
                "INR",
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
                subtotal,
                gstAmount,
                shippingCharge,
                finalAmount,

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

            const calculatedFinalAmount =
                Number(subtotal) +
                Number(gstAmount) +
                Number(shippingCharge);

            if (
                Number(
                    finalAmount.toFixed(2)
                ) !==
                Number(
                    calculatedFinalAmount.toFixed(2)
                )
            ) {
                throw new Error(
                    "Invalid amount calculation"
                );
            }

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
                        hsnCode: item.hsnCode,
                        gstRate: item.gstRate,
                        price:
                            item.price,
                        totalPrice:
                            item.quantity *
                            item.price,
                    })
                );

            let order =
                await Order.create({
                    user,
                    items,
                    deliveryAddress,
                    deliverySlot: {
                        date:
                            deliverySlot.date,
                        time:
                            deliverySlot.time,
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
                        razorpay_payment_id || "",
                });

            const invoiceData: any =
                await generateInvoicePdf(order);

            order.invoiceUrl =
                invoiceData.url;

            order.invoicePublicId =
                invoiceData.public_id;

            await order.save();
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

export const getAllOrdersService = async ({
    page = 1,
    limit = 10,
    search = "",
    orderStatus,
    paymentMethod,
    paymentStatus,
}: GetOrdersParams) => {
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (search?.trim()) {
        query.$expr = {
            $regexMatch: {
                input: { $toString: "$_id" },
                regex: search,
                options: "i",
            },
        };
    }

    if (
        orderStatus !== undefined &&
        orderStatus !== ""
    ) {
        query.orderStatus = Number(orderStatus);
    }

    if (
        paymentStatus !== undefined &&
        paymentStatus !== ""
    ) {
        query.paymentStatus = Number(paymentStatus);
    }

    if (
        paymentMethod !== undefined &&
        paymentMethod !== ""
    ) {
        query.paymentMethod = paymentMethod;
    }

    const [orders, totalOrders] = await Promise.all([
        Order.find(query)
            .select({
                items: 1,
                paymentStatus: 1,
                paymentMethod: 1,
                orderStatus: 1,
                finalAmount: 1,
                invoiceUrl: 1,
                invoicePublicId: 1,
                createdAt: 1,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Order.countDocuments(query),
    ]);

    const formattedOrders = orders.map((order) => ({
        orderId: order._id,

        itemsCount: order.items?.length ?? 0,

        paymentStatus: order.paymentStatus,

        paymentMethod: order.paymentMethod,

        orderStatus: order.orderStatus,

        finalAmount: order.finalAmount,

        invoice: {
            invoiceId: order.invoicePublicId,
            invoiceUrl: order.invoiceUrl,
        },

        createdAt: order.createdAt,
    }));

    return {
        orders: formattedOrders,

        pagination: {
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            limit,
        },
    };
};