import Users from "../models/users.model";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";

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