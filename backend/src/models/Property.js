import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    model3dUrl: { type: String, default: "" },
    model3dType: { type: String, default: "" },
    location: { type: String, default: "" },
    details: {
      price: { type: Number, default: 0 },
      bedrooms: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
      areaSqm: { type: Number, default: 0 },
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },
  },
  { timestamps: true }
);

// Search uses regex in the API (no text index required — works on fresh DB / Atlas / Docker)

export default mongoose.model("Property", propertySchema);

