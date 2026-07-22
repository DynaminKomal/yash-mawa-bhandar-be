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

    if (existing && !existing.isDeleted) {
        throw new Error("Product already exists");
    }

    data.category = category._id;
    data.code = code;
    data.isDeleted = false;

    return {
        processedData: data,
        existingProduct: existing && existing.isDeleted ? existing : null,
    };
};

export const getAllProducts = async (query: any) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 6;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const categoryCode = query.category?.trim();
    const sort = query.sort || "default";

    let filter: any = { isDeleted: false };

    // If request comes from Admin (or explicitly asks for all statuses), do not force isActive: true by default
    if (query.isAdmin || query.isAdmin === "true") {
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive;
        }
        if (query.inStock !== undefined) {
            filter.inStock = query.inStock;
        }
    } else {
        // Customer / Public API defaults to active products only
        filter.isActive = query.isActive !== undefined ? query.isActive : true;

        if (query.inStock !== undefined) {
            filter.inStock = query.inStock;
        }
    }

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
    const product = await Product.findOne({ _id: id, isDeleted: false });
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

    const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { new: true }
    ).populate({
        path: "category",
        select: "name code -_id",
    });

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
};

export const deleteProductById = async (id: string) => {
    const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, isActive: false },
        { new: true }
    );

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
};