import mongoose from "mongoose";

const travelGroupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    destination: { type: String, required: true },
    image: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true },

    currentMembers: { type: Number, default: 1 },
    maxMembers: { type: Number, required: true },

    isVerified: { type: Boolean, default: false },

    genderPreference: {
      type: String,
      enum: ["Male", "Female", "Mixed"],
      default: "Mixed",
    },

    description: { type: String, required: true },

    rules: [{ type: String }],

    members: [
      {
        name: { type: String, required: true },
        role: { type: String, enum: ["Organizer", "Member"], default: "Member" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("TravelGroup", travelGroupSchema);
