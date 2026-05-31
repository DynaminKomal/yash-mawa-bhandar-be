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

        unitType: String,

        images: [String],

        price: Number,

        inStock: Boolean,

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
                const newCategory = await NewCategory.create({
                    name: cat.name,

                    code: `${cat.code || cat.name}-${new mongoose.Types.ObjectId()}`,

                    description: cat.description,

                    image: cat.image,

                    isActive: cat.isActive,
                });

                categoryMap.set(
                    cat._id.toString(),
                    newCategory._id
                )
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

                await NewProduct.create({
                    name: prod.name,

                    code: `${prod.code || prod.name}-${new mongoose.Types.ObjectId()}`,

                    description: prod.description,

                    category:
                        mappedCategory || prod.category,

                    images: prod.images || [],

                    price: prod.price || 0,

                    unitType: prod.unitType,

                    inStock: prod.inStock,

                    isActive: prod.isActive,
                });
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