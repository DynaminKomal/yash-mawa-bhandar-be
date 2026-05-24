import mongoose, { Model, Schema, Document } from "mongoose";

export interface IPlantVisit extends Document {
    userName: string;
    phoneNumber: string;
    email: string;
    company: string;
    date: Date;
    numberVisitor: number;
    message: string;
    visitId: string;
    status: "pending" | "approved" | "rejected";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const plantVisitSchema = new Schema(
    {
        userName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true },
        company: { type: String, required: true },

        date: { type: Date, required: true },
        numberVisitor: { type: Number, required: true },
        message: { type: String, required: true },

        visitId: { type: String, unique: true },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        notes: String,
    },
    { timestamps: true }
);

plantVisitSchema.pre("save", function () {
    if (!this.visitId) {
        this.visitId = "VISIT-" + Date.now();
    }
});

const PlantVisit = (mongoose.models.PlantVisit || mongoose.model<IPlantVisit>('PlantVisit', plantVisitSchema)) as Model<IPlantVisit>;
export default PlantVisit;