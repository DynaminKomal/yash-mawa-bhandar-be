import Users from "../models/users.model";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import bcrypt from "bcryptjs";

export const updateUserProfile = async (
    userId: string,
    data: any,
    file?: UploadedFile
) => {
    let profileUrl = data.profile;

    if (file) {
        const upload = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
                folder: "yash-mawa-bhandar/users",
                public_id: file.name.replace(
                    /\.(jpg|jpeg|png|webp)$/i,
                    ""
                ),
            }
        );

        profileUrl = upload.secure_url;
    }

    const user = await Users.findByIdAndUpdate(
        userId,
        {
            ...data,
            profile: profileUrl,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


export const getUserProfile = async (userId: string) => {
    const user = await Users.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


export const deactivateUser = async (userId: string) => {
    const user = await Users.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const updatePassword = async (data: any) => {
    const user = await Users.findById(data.user)
        .select("+password");

    if (!user) {
        throw new Error("User not found");
    }
    const isMatch = await bcrypt.compare(
        data.oldPassword,
        user.password
    );

    if (!isMatch) {
        throw new Error("Old password is incorrect");
    }
    user.password = data.newPassword;
    await user.save();

};