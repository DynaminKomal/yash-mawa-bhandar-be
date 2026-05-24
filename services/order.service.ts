import Order from "../models/order.model";

export const createOrder = async (data: any) => {
    try {

        const order = await Order.create(data);

        return order;
    } catch (error) {
        throw error;
    }
};
