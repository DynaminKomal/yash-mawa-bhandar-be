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

export const getAllProducts = async (query: any) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 6;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const categoryCode = query.category?.trim();
    const sort = query.sort || "default";

    let filter: any = { isActive: true };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } },
        ];
    }
    if (categoryCode) {
        const category = await Category.findOne({
            code: categoryCode,
            isActive: true,
        });

        if (!category) {
            throw new Error("Category not found");
        }

        filter.category = category._id;
    }

    let sortOption: any = { createdAt: 1 };

    if (sort === "low-high") {
        sortOption = { price: 1 };
    } else if (sort === "high-low") {
        sortOption = { price: -1 };
    }

    const totalCount = await Product.countDocuments(filter);

    const items = await Product.find(filter)
        .populate({
            path: "category",
            select: "name code -_id",
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    return {
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        items,
    };
};

export const getProductById = async (id: string) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};

export const updateProductById = async (id: string, data: any) => {
    if (data.category) {
        const category = await Category.findOne({
            code: data.category,
            isActive: true,
        });

        if (!category) {
            throw new Error("Category not found");
        }

        data.category = category._id;
    }

    if (data.name) {
        const name = data.name.trim().toLowerCase();
        data.code = name
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    }

    const product = await Product.findByIdAndUpdate(id, data, {
        new: true,
    }).populate({
        path: "category",
        select: "name code -_id",
    });

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
};

export const deleteProductById = async (id: string) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
};