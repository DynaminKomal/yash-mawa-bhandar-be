import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
    user: mongoose.Types.ObjectId;

    fullName: string;
    phoneNumber: string;

    addressLine1: string;
    addressLine2?: string;

    city: string;
    state: string;
    pincode: string;

    landmark?: string;

    addressType: "home" | "office" | "other";

    isDefault: boolean;
}

const addressSchema = new Schema<IAddress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        fullName: {
            type: String,
            required: true,
        },

        phoneNumber: {
            type: String,
            required: true,
        },

        addressLine1: {
            type: String,
            required: true,
        },

        addressLine2: String,

        city: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },

        pincode: {
            type: String,
            required: true,
        },

        landmark: String,

        addressType: {
            type: String,
            enum: ["home", "office", "other"],
            default: "home",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Address =
    mongoose.models.Address ||
    mongoose.model<IAddress>("Address", addressSchema);

export default Address;