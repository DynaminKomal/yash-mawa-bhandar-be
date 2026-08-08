import crypto from "crypto";
import { razorpayInstance } from "../utility/razorpay";
import Cart from "../models/cart.model";
import Order from "../models/order.model";
import { generateInvoicePdf } from "./invoice.service";
import { v2 as cloudinary } from "cloudinary";

import {
    orderStatusEnum,
    paymentMethodEnum,
    paymentStatusEnum,
} from "../types/order.enum";
import { GetOrdersParams } from "../types/payment.type";
import { sendOrderEmailToAdmin, sendOrderStatusEmailToCustomer } from "../utility/mail";
import Notification from "../models/notification.model";
import { sendAdminFCMNotification } from "../utility/fcm";

const CANCEL_WINDOW_MS =
    3 * 60 * 60 * 1000;

const REFUND_PERCENT = 70;

interface CancelOrderPayload {
    orderId: string;
    userId: string;
    cancelReason: string;
}

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
                        hsnCode: item.product.hsnCode,
                        gstRate: item.product.gstRate,
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
            await sendOrderEmailToAdmin({
                order,
                invoiceUrl: invoiceData.url,
                event: "created",
            });

            // Create Admin Notification for new order
            try {
                await Notification.create({
                    title: "New Order Placed",
                    message: `New order #${order._id} of ₹${order.finalAmount} placed.`,
                    type: "order",
                    referenceId: order._id.toString(),
                });

                // Send FCM Push Notification to Admin devices
                await sendAdminFCMNotification({
                    title: "📦 New Order Placed!",
                    body: `Order #${order._id} for ₹${order.finalAmount} has been placed.`,
                    data: {
                        orderId: order._id.toString(),
                        type: "order",
                    },
                });
            } catch (err) {
                console.error("Error creating/sending Notification for order:", err);
            }
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
        query.paymentMethod = Number(paymentMethod);
    }

    const [orders, totalOrders] = await Promise.all([
        Order.find(query)
            .populate("user", "userName name email phoneNumber phone")
            .populate("deliveryAddress")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Order.countDocuments(query),
    ]);

    const formattedOrders = orders.map((order: any) => {
        const userName = order.user?.userName || order.user?.name || order.deliveryAddress?.fullName || "N/A";
        const userPhone = order.user?.phoneNumber || order.user?.phone || order.deliveryAddress?.phone || "N/A";
        const userEmail = order.user?.email || "N/A";

        return {
            orderId: order._id,
            itemsCount: order.items?.length ?? 0,
            items: order.items || [],
            user: {
                _id: order.user?._id || null,
                name: userName,
                email: userEmail,
                phoneNumber: userPhone,
            },
            deliveryAddress: order.deliveryAddress || null,
            deliverySlot: order.deliverySlot || null,
            subtotal: order.subtotal || 0,
            gstAmount: order.gstAmount || 0,
            shippingCharge: order.shippingCharge || 0,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            orderStatus: order.orderStatus,
            finalAmount: order.finalAmount,
            cancelReason: order.cancelReason || null,
            cancelledAt: order.cancelledAt || null,
            paidAt: order.paidAt || null,
            deliveredAt: order.deliveredAt || null,
            invoice: {
                invoiceId: order.invoicePublicId,
                invoiceUrl: order.invoiceUrl,
            },
            createdAt: order.createdAt,
        };
    });

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

export interface UpdateOrderStatusPayload {
    orderId: string;
    orderStatus: number;
    cancelReason?: string;
}

export const updateOrderStatusService = async ({
    orderId,
    orderStatus,
    cancelReason,
}: UpdateOrderStatusPayload) => {
    const order = await Order.findById(orderId).populate("user", "userName email name phoneNumber");
    if (!order) {
        throw new Error("Order not found.");
    }

    const targetStatus = Number(orderStatus);
    order.orderStatus = targetStatus;

    if (targetStatus === orderStatusEnum.CANCELLED) {
        order.cancelledAt = new Date();
        if (cancelReason?.trim()) {
            order.cancelReason = cancelReason.trim();
        }
    } else if (targetStatus === orderStatusEnum.DELIVERED) {
        order.deliveredAt = new Date();
        order.paymentStatus = paymentStatusEnum.PAID;
        if (!order.paidAt) {
            order.paidAt = new Date();
        }
    }

    await order.save();

    // Trigger email notification to customer on order status update
    try {
        const userObj: any = order.user;
        const userEmail = userObj?.email;
        const userName = userObj?.userName || userObj?.name || "Valued Customer";

        if (userEmail) {
            sendOrderStatusEmailToCustomer({
                order,
                userEmail,
                userName,
                status: targetStatus,
                cancelReason,
            }).catch((err) => {
                console.error("Async customer order status email error:", err);
            });
        } else {
            console.warn(`No user email found for order ${orderId}, status email skipped.`);
        }
    } catch (emailErr) {
        console.error("Failed to initiate order status email:", emailErr);
    }

    return order;
};


export const cancelOrderService = async ({
    orderId,
    userId,
    cancelReason,
}: CancelOrderPayload) => {
    if (!cancelReason?.trim()) {
        throw new Error("Cancellation reason is required.");
    }

    const order = await Order.findOne({
        _id: orderId,
        user: userId,
    });
    console.log("order", order)
    if (!order) {
        throw new Error("Order not found.");
    }

    // Only allow cancel for these statuses
    const cancellableStatuses = [
        orderStatusEnum.PENDING,
        orderStatusEnum.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(order.orderStatus)) {
        throw new Error(
            "Order cannot be cancelled in its current status."
        );
    }
    if (!order.createdAt) {
        throw new Error("Order creation date is missing.");
    }

    const expiresAt =
        new Date(order.createdAt).getTime() +
        CANCEL_WINDOW_MS;

    if (Date.now() > expiresAt) {
        throw new Error(
            "Cancellation window has expired. Orders can only be cancelled within 3 hours."
        );
    }

    // Refund calculation
    const refundAmount =
        (Number(order.finalAmount) * REFUND_PERCENT) / 100;

    // Update order
    order.orderStatus = orderStatusEnum.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason.trim();

    // Payment update
    if (order.paymentStatus === paymentStatusEnum.PAID) {
        order.paymentStatus =
            paymentStatusEnum.REFUND_INITIATED;
    }

    await order.save();


    // Delete old invoice (optional safe)
    if (order.invoicePublicId) {
        try {
            await cloudinary.uploader.destroy(
                order.invoicePublicId,
                {
                    resource_type: "raw",
                }
            );
        } catch (err) {
            console.error("Cloudinary delete failed:", err);
        }
    }

    try {
        const invoice = await generateInvoicePdf(order);

        order.invoiceUrl = invoice.url;
        order.invoicePublicId = invoice.public_id;

        await order.save();
        await sendOrderEmailToAdmin({
            order,
            invoiceUrl: invoice.url,
            event: "cancelled",
        });
    } catch (err) {
        console.error("Invoice regeneration failed:", err);
    }

    return {
        orderId: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        refundAmount,
        refundPercent: REFUND_PERCENT,
        cancelReason: order.cancelReason,
        cancelledAt: order.cancelledAt,
        invoice: {
            url: order.invoiceUrl,
            publicId: order.invoicePublicId,
        },
    };
};