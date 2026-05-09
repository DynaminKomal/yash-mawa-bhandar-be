import Address from "../models/address.model";
import Users from "../models/users.model";

export const createAddress = async (
    userId: string,
    data: any
) => {
    try {
        const existingUser = await Users.findById(userId);

        if (!existingUser) {
            throw new Error("User not found");
        }

        await Address.updateMany(
            { user: userId },
            { isDefault: false }
        );

        const address = await Address.create({
            user: userId,
            fullName: existingUser.userName,
            phoneNumber: existingUser.phoneNumber,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            landmark: data.landmark,
            addressType: data.addressType,
            isDefault: true,
        });

        return address;
    } catch (error) {
        throw error;
    }
};


export const getAllAddress = async (userId: string) => {
    try {
        const existingUser = await Users.findById(userId);

        if (!existingUser) {
            throw new Error("User not found");
        }
        const addresses = await Address.find({ user: userId })
            .sort({ createdAt: -1 });

        return addresses;
    }
    catch (error) {
        throw error;
    }

}


export const updateAddress = async (addressId: string, data: any) => {
    return Address.findByIdAndUpdate(addressId, data, {
        new: true,
        runValidators: true,
    });
};

export const deleteAddress = async (addressId: string) => {
    return Address.findByIdAndDelete(addressId);
};

export const setDefaultAddress = async (addressId: string) => {
    const address = await Address.findById(addressId);

    if (!address) throw new Error("Address not found");

    await Address.updateMany(
        { user: address.user },
        { isDefault: false }
    );

    const updated = await Address.findByIdAndUpdate(
        addressId,
        { isDefault: true },
        { new: true }
    );

    return updated;
};