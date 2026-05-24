import mongoose, { Model, Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    profile: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: Date;
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
        profile: {
            type: String,
            default: "",
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },

        dateOfBirth: {
            type: Date,
        },
        password: {
            type: String,
            required: true,
            select: false,
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


userSchema.methods.correctPassword = async function (candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

const User = (mongoose.models.User || mongoose.model<IUser>('User', userSchema)) as Model<IUser>;
export default User;