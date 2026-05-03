import contactModel from "../models/contact.model";

export const createContact = async (data: any) => {
    try {
        const contact = await contactModel.create({
            ...data,
        });
        return contact;
    } catch (err: any) {
        throw err;
    }
};