import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;

    deliveryAddress: string;

    role: "customer" | "admin";

    isActive: boolean;
    isVerified: boolean;

    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        phoneNumber: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        deliveryAddress: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);


userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 12);
});


userSchema.methods.comparePassword = async function (
    candidatePassword: string
) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);