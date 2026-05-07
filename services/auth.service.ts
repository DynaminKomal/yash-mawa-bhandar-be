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