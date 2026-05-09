import Address from "../models/address.model";
import Users from "../models/users.model";

export const signup = async (data: any) => {
    try {
        const {
            email,
            address,
            userName,
            phoneNumber,
        } = data;

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            throw new Error("User already exists");
        }

        const user = await Users.create({
            userName: data.userName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: data.password,
        });

        await Address.create({
            user: user._id,
            fullName: userName,
            phoneNumber,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            landmark: address.landmark,
            addressType: address.addressType || "home",
            isDefault: true,
        });

        return user

    } catch (error) {
        throw error;
    }
};

export const login = async (data: any) => {
    try {
        const { email, password } = data;

        const existingUser = await Users.findOne({
            $or: [
                { email },
                { phoneNumber: email }
            ]
        }).select("+password");

        if (!existingUser) {
            throw new Error("User does not exist");
        }

        const isPasswordCorrect =
            await existingUser.comparePassword(password);

        if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
        }

        existingUser.password = undefined as any;

        return existingUser;
    } catch (error) {
        throw error;
    }
};