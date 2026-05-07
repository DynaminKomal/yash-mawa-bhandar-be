import Users from "../models/users.model";

export const signup = async (data: any) => {
    try {
        const {
            email,
        } = data

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            throw new Error("User already exists");
        }

        const user = await Users.create(data);

        return user

    } catch (error) {
        throw error;
    }
};

export const login = async (data: any) => {
    try {
        const { email, password } = data;

        const existingUser = await Users.findOne({ email }).select("+password");

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