import Cart, { ICartItem } from "../models/cart.model";
import Product from "../models/products.model";

export const createCartItems = async (data: any) => {
    try {
        const productExist = await Product.findById(
            data.item.product
        );

        if (!productExist) {
            throw new Error("Product not found");
        }

        let cart = await Cart.findOne({
            user: data.user,
        });

        if (!cart) {
            cart = await Cart.create({
                user: data.user,
                items: [],
                totalAmount: 0,
            });
        }

        const existingItemIndex = cart.items.findIndex(
            (item: ICartItem) =>
                item.product.toString() ===
                data.item.product.toString()
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity +=
                data.item.quantity;

        } else {
            cart.items.push(data.item);
        }
        cart.totalAmount = cart.items.reduce(
            (acc: number, item: ICartItem) =>
                acc + item.price * item.quantity,
            0
        );

        await cart.save();

        return cart;

    } catch (error) {
        throw error;
    }
};

export const getCartForUser = async (userId: string) => {
    const cart = await Cart.findOne({ user: userId })
        .populate("items.product", "name price images unitType hsnCode gstRate");

    if (!cart) {
        return {
            items: [],
            totalAmount: 0,
        };
    }

    return {
        items: cart.items.map((item: any) => {
            return {
                id: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0] || "",
                price: item.price,
                unitType: item.unitType,
                quantity: item.quantity,
                hsnCode: item.product.hsnCode,
                gstRate: item.product.gstRate,
                weightInGram: item.unitType === 'pack' ? (1 * item.quantity) : (1000 * item.quantity)

            }
        }),
        totalAmount: cart.totalAmount,
    };
};

export const updateCartItem = async (data: any) => {
    const cart = await Cart.findOne({ user: data.user });

    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(
        (i: ICartItem) => i.product.toString() === data.productId
    );

    if (!item) throw new Error("Item not found");

    item.quantity = data.quantity;

    cart.totalAmount = cart.items.reduce(
        (acc: number, i: ICartItem) => acc + i.price * i.quantity,
        0
    );

    await cart.save();

    return cart;
};

export const deleteCartItem = async (data: any) => {
    const cart = await Cart.findOne({ user: data.user });

    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(
        (i: ICartItem) => i.product.toString() !== data.productId
    );

    cart.totalAmount = cart.items.reduce(
        (acc: number, i: ICartItem) => acc + i.price * i.quantity,
        0
    );

    await cart.save();

    return cart;
};