import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  avatar: { type: String, default: undefined },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: { type: Date, default: Date.now, immutable: true },
  lastConnection: { type: Date, default: Date.now },
  prefTheme: {
    type: String,
    enum: ["light", "dark", undefined],
    default: undefined,
  },
  stats: {
    pixelBoardsParticipated: { type: Number, default: 0 },
    pixelPainted: { type: Number, default: 0 },
    lastPixelTouched: { type: Date, default: null },
  },
  contributions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Contribution",
      default: [],
    },
  ],
});

userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model("User", userSchema);
