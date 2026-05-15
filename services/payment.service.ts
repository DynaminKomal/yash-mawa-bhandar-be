import { razorpayInstance } from "../utility/razorpay";
import crypto from "crypto";

export const createRazorpayOrder = async (amount: number) => {
    try {

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);

        return order;

    } catch (error) {
        throw error;
    }
};


export const verifyPayment = ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}: any) => {

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET!)
        .update(
            razorpay_order_id + "|" + razorpay_payment_id
        )
        .digest("hex");

    return generatedSignature === razorpay_signature;
};