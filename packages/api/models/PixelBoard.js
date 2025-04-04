import mongoose, { Schema } from "mongoose";
import { Contribution } from "./Contribution.js";

const pixelSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  color: { type: String, required: true },
  placedBy: { type: Schema.Types.ObjectId, ref: "User" },
  isVisitor: { type: Boolean, default: false },
  placedAt: { type: Date, default: Date.now },
});

const pixelBoardSchema = new Schema({
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ["draft", "active", "completed"],
    default: "draft",
  },
  creationDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  width: {
    type: Number,
    required: true,
    min: 100,
    max: 1000,
  },
  height: {
    type: Number,
    required: true,
    min: 100,
    max: 1000,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  allowOverwriting: {
    type: Boolean,
    default: false,
  },
  participationDelay: {
    type: Number,
    required: true,
    min: 10, // Minimum 10 seconds
  },
  pixels: [pixelSchema],
  contributions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Contribution",
    },
  ],
});

// Créer un index composite pour garantir qu'un pixel ne peut exister qu'une fois à une coordonnée spécifique
pixelBoardSchema.index({ "pixels.x": 1, "pixels.y": 1 });

// Méthode pour vérifier si un utilisateur peut placer un pixel
pixelBoardSchema.methods.canUserPlacePixel = function (userId) {
  // Vérifier si le board est actif
  if (this.status !== "active") {
    return {
      canPlace: false,
      reason: "Ce PixelBoard n'est pas actif",
    };
  }

  // Vérifier si la date de fin n'est pas dépassée
  if (new Date() > this.endDate) {
    return {
      canPlace: false,
      reason: "Ce PixelBoard est terminé",
    };
  }

  // Vérifier le délai depuis le dernier placement
  const userPixels = this.pixels.filter(
    (pixel) =>
      pixel.placedBy && pixel.placedBy.toString() === userId.toString(),
  );

  if (userPixels.length > 0) {
    // Trouver le pixel le plus récent de l'utilisateur
    const lastPlaced = userPixels.reduce((latest, pixel) => {
      return latest.placedAt > pixel.placedAt ? latest : pixel;
    });

    const now = new Date();
    const timeSinceLastPlacement =
      (now.getTime() - lastPlaced.placedAt.getTime()) / 1000;

    if (timeSinceLastPlacement < this.participationDelay) {
      const timeLeft = Math.ceil(
        this.participationDelay - timeSinceLastPlacement,
      );
      return {
        canPlace: false,
        reason: `Vous devez attendre encore ${timeLeft} secondes avant de placer un nouveau pixel`,
        timeLeft,
      };
    }
  }

  return { canPlace: true };
};

// Méthode pour placer un pixel
pixelBoardSchema.methods.placePixel = async function (
  x,
  y,
  color,
  userId,
  isVisitor = false,
) {
  // Vérifier si les coordonnées sont valides
  if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
    throw new Error("Coordonnées de pixel invalides");
  }

  // Vérifier si cette position est déjà occupée
  const existingPixelIndex = this.pixels.findIndex(
    (pixel) => pixel.x === x && pixel.y === y,
  );

  if (existingPixelIndex >= 0 && !this.allowOverwriting) {
    throw new Error("Ce pixel est déjà occupé");
  }

  const contribution = new Contribution({
    user: userId,
    pixelBoard: this._id,
    pixelX: x,
    pixelY: y,
    color,
    timestamp: new Date(),
  });
  console.log("NOUVELLE CONTRIBUTION", contribution);

  // Save the contribution
  await contribution.save();

  // Update the user with the new contribution
  const User = mongoose.model("User");
  await User.findByIdAndUpdate(userId, {
    $push: { contributions: contribution._id },
    $inc: { "stats.pixelPainted": 1 },
    $set: { "stats.lastPixelTouched": new Date() },
  });

  // Add the contribution to the contributions array
  this.contributions.push(contribution._id);

  if (existingPixelIndex >= 0) {
    // Mettre à jour le pixel existant
    this.pixels[existingPixelIndex].color = color;
    this.pixels[existingPixelIndex].placedBy = userId;
    this.pixels[existingPixelIndex].isVisitor = isVisitor;
    this.pixels[existingPixelIndex].placedAt = new Date();
  } else {
    // Ajouter un nouveau pixel
    this.pixels.push({
      x,
      y,
      color,
      placedBy: userId,
      isVisitor,
      placedAt: new Date(),
    });
  }

  return this;
};

// Méthode pour obtenir tous les contributeurs uniques
pixelBoardSchema.methods.getContributors = function () {
  const contributorIds = [
    ...new Set(
      this.pixels
        .filter((pixel) => pixel.placedBy)
        .map((pixel) => pixel.placedBy.toString()),
    ),
  ];

  return contributorIds;
};

// Middleware pre-save pour vérifier et mettre à jour le statut en fonction de la date
pixelBoardSchema.pre("save", function (next) {
  const now = new Date();

  // Si la date de fin est dépassée, marquer comme terminé
  if (now > this.endDate && this.status !== "completed") {
    this.status = "completed";
  }

  next();
});

export const PixelBoard = mongoose.model("PixelBoard", pixelBoardSchema);
