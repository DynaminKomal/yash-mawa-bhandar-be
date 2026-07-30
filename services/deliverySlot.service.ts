import DeliverySlot from "../models/deliverySlot.model";

export const createDeliverySlot = async (data: any) => {
    try {
        const slot = await DeliverySlot.create(data);
        return slot;
    } catch (err: any) {
        throw err;
    }
};

export const getAllDeliverySlots = async (query: any = {}) => {
    try {
        const filter: any = { isDeleted: { $ne: true } };

        if (query.active === "true") {
            filter.isActive = true;
        } else if (query.active === "false") {
            filter.isActive = false;
        }

        if (query.search) {
            const searchRegex = new RegExp(query.search, "i");
            filter.name = searchRegex;
        }

        const slots = await DeliverySlot.find(filter).sort({ createdAt: 1 });
        return slots;
    } catch (err: any) {
        throw err;
    }
};

export const updateDeliverySlot = async (id: string, data: any) => {
    try {
        const slot = await DeliverySlot.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $set: data },
            { new: true }
        );

        if (!slot) {
            throw new Error("Delivery slot not found");
        }

        return slot;
    } catch (err: any) {
        throw err;
    }
};

export const toggleDeliverySlotStatus = async (id: string, isActive?: boolean) => {
    try {
        const currentSlot = await DeliverySlot.findOne({ _id: id, isDeleted: { $ne: true } });
        if (!currentSlot) {
            throw new Error("Delivery slot not found");
        }

        const newActiveStatus = isActive !== undefined ? isActive : !currentSlot.isActive;
        currentSlot.isActive = newActiveStatus;
        await currentSlot.save();

        return currentSlot;
    } catch (err: any) {
        throw err;
    }
};

export const softDeleteDeliverySlot = async (id: string) => {
    try {
        const slot = await DeliverySlot.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!slot) {
            throw new Error("Delivery slot not found");
        }

        return slot;
    } catch (err: any) {
        throw err;
    }
};
