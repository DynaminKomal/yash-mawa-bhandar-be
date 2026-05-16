import contactModel from "../models/contact.model";

interface GetContactsQuery {
    subject?: string;
    rating?: string;
    page?: number;
    limit?: number;
}

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

export const getAllContacts = async ({
    subject,
    rating,
    page = 1,
    limit = 10,
}: GetContactsQuery) => {
    try {
        const filter: any = {};
        if (subject) {
            filter.subject = subject;
        }
        if (rating) {
            filter.rating = { $gte: rating };
        }

        const skip = (page - 1) * limit;

        const contacts = await contactModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await contactModel.countDocuments(filter);

        return {
            items: contacts,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (err: any) {
        throw err;
    }
};