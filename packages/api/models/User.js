import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
  createAt: { type: Date, default: Date.now , immutable : true },
  lastConnection: { type: Date, default: Date.now },
  prefTheme: { type: String, default: "light" },
  stats : {
    pixelBoardsCreated: { type: Number, default: 0 },
    pixelBoardsParticipated: { type: Number, default: 0 },
    pixelPainted: { type: Number, default: 0 },
    lastPixelTouched : { type: Date, default: Date.now }
  },
});

userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model("User", userSchema);
