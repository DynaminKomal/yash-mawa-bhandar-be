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