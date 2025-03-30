import mongoose, { Schema } from "mongoose";

export const contributionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  pixelBoard: {
    type: Schema.Types.ObjectId,
    ref: "PixelBoard",
    required: true,
  },
  pixelX: { type: Number, required: true },
  pixelY: { type: Number, required: true },
  color: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Contribution = mongoose.model("Contribution", contributionSchema);
