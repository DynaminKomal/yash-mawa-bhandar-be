import Category from '../models/category.model';


export const createCategory = async (data: any) => {

    const name = data.name.trim().toLowerCase();
    const code = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const existing = await Category.findOne({
        $or: [
            { name: { $regex: `^${name}$`} },
            { code },
        ],
    });
    if (existing) {
        throw new Error("Category already exists");
    }
    try {
        return await Category.create(data);
    } catch (err: any) {
        if (err.code === 11000) {
            throw new Error("Category code already exists");
        }
        throw err;
    }
};

export const getAllCategories = async () => {
    return await Category.find({ isActive: true }).sort({ createdAt: 1 });
};

export const getCategoryById = async (id: string) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new Error("Category not found");
    }
    return category;
};

export const updateCategory = async (id: string, data: any) => {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
};

export const deleteCategory = async (id: string) => {
    const category = await Category.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
};