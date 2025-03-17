import mongoose, { Schema } from "mongoose";
import ThemeEnum from "./themeEnum";

const userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  avatar: { type: String, default: undefined },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
  createdAt: { type: Date, default: Date.now , immutable : true },
  lastConnection: { type: Date, default: Date.now },
  prefTheme: { type: ThemeEnum, default: undefined },
  stats : {
    pixelBoardsParticipated: { type: Number, default: 0 },
    pixelPainted: { type: Number, default: 0 },
    lastPixelTouched : { type: Date, default: null }
  },
});

userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model("User", userSchema);
