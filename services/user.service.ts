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

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: string | boolean;
}

export const getAllUsersService = async ({
    page = 1,
    limit = 10,
    search = "",
    role,
    isActive,
}: GetUsersParams) => {
    const skip = (page - 1) * limit;
    const query: Record<string, any> = {};

    if (search?.trim()) {
        query.$or = [
            { userName: { $regex: search.trim(), $options: "i" } },
            { email: { $regex: search.trim(), $options: "i" } },
            { phoneNumber: { $regex: search.trim(), $options: "i" } },
        ];
    }

    if (role && role !== "all") {
        query.role = role;
    }

    if (isActive !== undefined && isActive !== "" && isActive !== "all") {
        query.isActive = isActive === "true" || isActive === true;
    }

    const [users, totalUsers] = await Promise.all([
        Users.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Users.countDocuments(query),
    ]);

    return {
        users,
        pagination: {
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            limit,
        },
    };
};