import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const OLD_DB = process.env.DATABASE_STRING!
    .replace("<PASSWORD>", process.env.DATABASE_PASSWORD!)
    .replace("DB_NAME", process.env.DATABASE_NAME!);

const NEW_DB = process.env.DATABASE_STRING!
    .replace("<PASSWORD>", process.env.DATABASE_PASSWORD!)
    .replace("DB_NAME", process.env.NEW_DATABASE_NAME!);

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            unique: true,
            lowercase: true,
        },

        description: String,

        image: String,

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            unique: true,
            lowercase: true,
        },

        description: String,

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        hsnCode: String,
        gstRate: Number,
        unitType: String,
        images: [String],
        price: Number,
        inStock: Boolean,
        isDeleted: Boolean,
        isActive: Boolean,
    },
    {
        timestamps: true,
    }
);

async function connect(uri: string) {
    return mongoose.createConnection(uri).asPromise();
}

async function migrate() {
    try {
        console.log("Connecting OLD DB...");
        const oldConn = await connect(OLD_DB);

        console.log("Connecting NEW DB...");
        const newConn = await connect(NEW_DB);

        console.log("DATABASES CONNECTED");

        const OldCategory = oldConn.model(
            "Category",
            categorySchema,
            "categories"
        );

        const OldProduct = oldConn.model(
            "Product",
            productSchema,
            "products"
        );

        const NewCategory = newConn.model(
            "Category",
            categorySchema,
            "categories"
        );

        const NewProduct = newConn.model(
            "Product",
            productSchema,
            "products"
        );

        const categories = await OldCategory.find({});

        console.log(`Found ${categories.length} categories`);

        const categoryMap = new Map<
            string,
            mongoose.Types.ObjectId
        >();

        for (const cat of categories) {
            try {
                const catCode = cat.code || cat.name;

                let existingCategory = await NewCategory.findOne({
                    $or: [
                        { _id: cat._id },
                        { code: catCode },
                        { name: cat.name }
                    ]
                });

                if (existingCategory) {
                    existingCategory.name = cat.name;
                    existingCategory.code = catCode;
                    existingCategory.description = cat.description;
                    existingCategory.image = cat.image;
                    if (cat.isActive !== undefined) existingCategory.isActive = cat.isActive;
                    await existingCategory.save();
                    console.log(`Updated Category: ${cat.name}`);

                    categoryMap.set(
                        cat._id.toString(),
                        existingCategory._id as mongoose.Types.ObjectId
                    );
                } else {
                    const newCategory = await NewCategory.create({
                        _id: cat._id,
                        name: cat.name,
                        code: catCode,
                        description: cat.description,
                        image: cat.image,
                        isActive: cat.isActive,
                    });
                    console.log(`Created Category: ${cat.name}`);

                    categoryMap.set(
                        cat._id.toString(),
                        newCategory._id as mongoose.Types.ObjectId
                    );
                }
            } catch (err) {
                console.error(
                    `Category Failed: ${cat.name}`
                );

                console.error(err);
            }
        }

        const products = await OldProduct.find({});

        console.log(`Found ${products.length} products`);

        for (const prod of products) {
            try {
                const mappedCategory =
                    categoryMap.get(
                        prod.category?.toString()
                    );

                const prodCode = prod.code || prod.name;

                let existingProduct = await NewProduct.findOne({
                    $or: [
                        { _id: prod._id },
                        { code: prodCode },
                        { name: prod.name }
                    ]
                });

                if (existingProduct) {
                    existingProduct.name = prod.name;
                    existingProduct.code = prodCode;
                    existingProduct.description = prod.description;
                    existingProduct.category = mappedCategory || prod.category;
                    existingProduct.images = prod.images || [];
                    existingProduct.price = prod.price ?? 0;
                    existingProduct.hsnCode = prod.hsnCode;
                    existingProduct.gstRate = prod.gstRate ?? 0;
                    existingProduct.unitType = prod.unitType;
                    if (prod.inStock !== undefined) existingProduct.inStock = prod.inStock;
                    if (prod.isDeleted !== undefined) existingProduct.isDeleted = prod.isDeleted;
                    if (prod.isActive !== undefined) existingProduct.isActive = prod.isActive;
                    await existingProduct.save();
                    console.log(`Updated Product: ${prod.name}`);
                } else {
                    await NewProduct.create({
                        _id: prod._id,
                        name: prod.name,
                        code: prodCode,
                        description: prod.description,
                        category: mappedCategory || prod.category,
                        images: prod.images || [],
                        price: prod.price ?? 0,
                        hsnCode: prod.hsnCode,
                        gstRate: prod.gstRate ?? 0,
                        unitType: prod.unitType,
                        inStock: prod.inStock,
                        isDeleted: prod.isDeleted,
                        isActive: prod.isActive,
                    });
                    console.log(`Created Product: ${prod.name}`);
                }
            } catch (err) {
                console.error(
                    `Product Failed: ${prod.name}`
                );

                console.error(err);
            }
        }

        await oldConn.close();
        await newConn.close();

        console.log("MIGRATION COMPLETED");

        process.exit(0);
    } catch (error) {
        console.error("MIGRATION ERROR");

        console.error(error);

        process.exit(1);
    }
}

migrate();