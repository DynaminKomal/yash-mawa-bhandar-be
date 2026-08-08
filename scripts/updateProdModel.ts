import mongoose from "mongoose";
import dotenv from "dotenv";

// Import models
import User from "../models/users.model";
import Product from "../models/products.model";
import Category from "../models/category.model";

dotenv.config();

// CLI Arguments parsing
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run") || process.env.DRY_RUN === "true";
const targetModelArg = args.find((arg) => arg.startsWith("--target="))?.split("=")[1] || process.env.TARGET_MODEL || "all";

// Determine DB Connection String
const dbPassword = process.env.DATABASE_PASSWORD || "";
const dbName = process.env.NEW_DATABASE_NAME || process.env.DATABASE_NAME || "yash-mawa-bhandar";
const rawUri = process.env.DATABASE_STRING || "";

if (!rawUri || !dbPassword) {
  console.error("❌ Missing DATABASE_STRING or DATABASE_PASSWORD in environment variables.");
  process.exit(1);
}

const dbUri = rawUri.replace("<PASSWORD>", dbPassword).replace("DB_NAME", dbName);

async function connectDB(): Promise<void> {
  console.log(`🔌 Connecting to Production Database: [${dbName}] ...`);
  await mongoose.connect(dbUri);
  console.log(`✅ Successfully connected to database: ${dbName}`);
}

async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log("🔌 Database connection closed.");
}

/**
 * Updates Product documents in production DB
 * - Ensures missing fields have standard defaults
 * - Generates missing product codes from name if blank
 */
async function updateProductModel(): Promise<void> {
  console.log("\n📦 --- Updating Product Model ---");
  const products = await Product.find({});
  console.log(`Found ${products.length} products to check.`);

  let updatedCount = 0;

  for (const prod of products) {
    let modified = false;

    // Check code field
    if (!prod.code && prod.name) {
      const generatedCode = prod.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      console.log(`  [Product ${prod._id}] Setting missing code -> "${generatedCode}"`);
      prod.code = generatedCode;
      modified = true;
    }

    // Check isDeleted field
    if (prod.isDeleted === undefined || prod.isDeleted === null) {
      console.log(`  [Product ${prod._id}] Setting isDeleted -> false`);
      prod.isDeleted = false;
      modified = true;
    }

    // Check isActive field
    if (prod.isActive === undefined || prod.isActive === null) {
      console.log(`  [Product ${prod._id}] Setting isActive -> true`);
      prod.isActive = true;
      modified = true;
    }

    // Check inStock field
    if (prod.inStock === undefined || prod.inStock === null) {
      console.log(`  [Product ${prod._id}] Setting inStock -> true`);
      prod.inStock = true;
      modified = true;
    }

    if (modified) {
      updatedCount++;
      if (!isDryRun) {
        await prod.save();
      }
    }
  }

  console.log(`✨ Product model check complete. ${updatedCount} document(s) ${isDryRun ? "would be updated (DRY RUN)" : "updated"}.`);
}

/**
 * Updates User documents in production DB
 * - Ensures missing profile, fcmToken, isActive, isVerified, role fields have defaults
 */
async function updateUserModel(): Promise<void> {
  console.log("\n👤 --- Updating User Model ---");
  const users = await User.find({});
  console.log(`Found ${users.length} users to check.`);

  let updatedCount = 0;

  for (const user of users) {
    let modified = false;

    if (user.profile === undefined || user.profile === null) {
      console.log(`  [User ${user._id}] Setting profile -> ""`);
      user.profile = "";
      modified = true;
    }

    if (user.fcmToken === undefined || user.fcmToken === null) {
      console.log(`  [User ${user._id}] Setting fcmToken -> ""`);
      user.fcmToken = "";
      modified = true;
    }

    if (user.isActive === undefined || user.isActive === null) {
      console.log(`  [User ${user._id}] Setting isActive -> true`);
      user.isActive = true;
      modified = true;
    }

    if (user.isVerified === undefined || user.isVerified === null) {
      console.log(`  [User ${user._id}] Setting isVerified -> false`);
      user.isVerified = false;
      modified = true;
    }

    if (!user.role) {
      console.log(`  [User ${user._id}] Setting role -> "customer"`);
      user.role = "customer";
      modified = true;
    }

    if (modified) {
      updatedCount++;
      if (!isDryRun) {
        await user.save();
      }
    }
  }

  console.log(`✨ User model check complete. ${updatedCount} document(s) ${isDryRun ? "would be updated (DRY RUN)" : "updated"}.`);
}

/**
 * Updates Category documents in production DB
 */
async function updateCategoryModel(): Promise<void> {
  console.log("\n🏷️ --- Updating Category Model ---");
  const categories = await Category.find({});
  console.log(`Found ${categories.length} categories to check.`);

  let updatedCount = 0;

  for (const cat of categories) {
    let modified = false;

    if (!cat.code && cat.name) {
      const generatedCode = cat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      console.log(`  [Category ${cat._id}] Setting missing code -> "${generatedCode}"`);
      cat.code = generatedCode;
      modified = true;
    }

    if (cat.isActive === undefined || cat.isActive === null) {
      console.log(`  [Category ${cat._id}] Setting isActive -> true`);
      cat.isActive = true;
      modified = true;
    }

    if (modified) {
      updatedCount++;
      if (!isDryRun) {
        await cat.save();
      }
    }
  }

  console.log(`✨ Category model check complete. ${updatedCount} document(s) ${isDryRun ? "would be updated (DRY RUN)" : "updated"}.`);
}

/**
 * Helper function to run direct MongoDB updates on document data.
 * You can call this to update specific fields across any collection in the DB.
 * 
 * Example usage:
 *   await updateCustomCollectionData("products", { price: { $exists: false } }, { $set: { price: 0 } });
 */
export async function updateCustomCollectionData(
  collectionName: string,
  filter: Record<string, any>,
  updateQuery: Record<string, any>
): Promise<void> {
  console.log(`\n🛠️ --- Updating Data in Collection: [${collectionName}] ---`);
  console.log(`  Filter: ${JSON.stringify(filter)}`);
  console.log(`  Update: ${JSON.stringify(updateQuery)}`);

  if (!mongoose.connection.db) {
    console.error("❌ Database not connected.");
    return;
  }

  const collection = mongoose.connection.db.collection(collectionName);
  const matchedCount = await collection.countDocuments(filter);
  console.log(`Found ${matchedCount} matching document(s) in "${collectionName}".`);

  if (matchedCount > 0) {
    if (isDryRun) {
      console.log(`  🔍 DRY RUN: Would update ${matchedCount} document(s).`);
    } else {
      const result = await collection.updateMany(filter, updateQuery);
      console.log(`  ✅ Modified ${result.modifiedCount} document(s).`);
    }
  }
}


/**
 * Main Execution Workflow
 */
async function runUpdateScript(): Promise<void> {
  console.log("=========================================");
  console.log("🚀 Production Model Update Script Started");
  if (isDryRun) {
    console.log("🔍 MODE: DRY RUN (No database writes will occur)");
  } else {
    console.log("⚡ MODE: LIVE UPDATE (Database will be updated)");
  }
  console.log(`🎯 Target Model: ${targetModelArg.toUpperCase()}`);
  console.log("=========================================");

  try {
    await connectDB();

    const target = targetModelArg.toLowerCase();

    if (target === "product" || target === "products") {
      await updateProductModel();
    } else if (target === "user" || target === "users") {
      await updateUserModel();
    } else if (target === "category" || target === "categories") {
      await updateCategoryModel();
    } else if (target === "all") {
      await updateProductModel();
      await updateUserModel();
      await updateCategoryModel();
    } else {
      console.warn(`⚠️ Unknown target model "${targetModelArg}". Available options: product, user, category, all.`);
    }

    console.log("\n=========================================");
    console.log("🎉 Production Model Update Script Completed Successfully!");
    console.log("=========================================");
  } catch (error) {
    console.error("\n❌ Error running update script:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    process.exit();
  }
}

runUpdateScript();
