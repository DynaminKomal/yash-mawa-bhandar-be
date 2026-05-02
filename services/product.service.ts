import Product from '../models/products.model';
import Category from '../models/category.model';

export const createProduct = async (data: any) => {

    const name = data.name.trim().toLowerCase();
    const code = name
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const category = await Category.findOne({
        code: data.category,
        isActive: true,
    });

    if (!category) {
        throw new Error("Category not found");
    }

    const existing = await Product.findOne({
        $or: [
            { name: { $regex: `^${name}$`, $options: "i" } },
            { code },
        ],
    });

    if (existing) {
        throw new Error("Product already exists");
    }

    data.category = category._id;
    data.code = code;

    return data;
};

export const getAllProducts = async () => {
    return await Product.find({ isActive: true }).sort({ createdAt: 1 });
};