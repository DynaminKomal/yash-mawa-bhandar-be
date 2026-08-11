import plantVisitModel from "../models/plantVisit.model";

export const createPlantVisitRequest = async (data: any) => {
    try {
        const visit = await plantVisitModel.create({
            ...data,
            date: new Date(data.date),
        });

        return visit;
    } catch (err: any) {
        throw err;
    }
};

export const getAllPlantVisitRequests = async (query: any = {}) => {
    try {
        const filter: any = { isDeleted: { $ne: true } };

        if (query.status && query.status !== "all") {
            filter.status = query.status;
        }

        if (query.search) {
            const searchRegex = new RegExp(query.search, "i");
            filter.$or = [
                { userName: searchRegex },
                { email: searchRegex },
                { company: searchRegex },
                { visitId: searchRegex },
                { phoneNumber: searchRegex },
            ];
        }

        const visits = await plantVisitModel.find(filter).sort({ createdAt: -1 });
        return visits;
    } catch (err: any) {
        throw err;
    }
};

export const updatePlantVisitStatus = async (
    id: string,
    status: "approved" | "rejected",
    notes?: string
) => {
    try {
        const updateData: any = { status };
        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const visit = await plantVisitModel.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $set: updateData },
            { new: true }
        );

        if (!visit) {
            throw new Error("Plant visit request not found");
        }

        return visit;
    } catch (err: any) {
        throw err;
    }
};

export const softDeletePlantVisitRequest = async (id: string) => {
    try {
        const visit = await plantVisitModel.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!visit) {
            throw new Error("Plant visit request not found");
        }

        return visit;
    } catch (err: any) {
        throw err;
    }
};