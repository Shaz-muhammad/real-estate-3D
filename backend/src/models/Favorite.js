import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ buyerId: 1, propertyId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
