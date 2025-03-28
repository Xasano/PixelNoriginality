import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

const visitorSchema = new Schema({
    visitorId: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomUUID()
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // Expire après 7 jours (en secondes)
    },
    lastConnection: {
        type: Date,
        default: Date.now
    },
    lastPixelPlaced: {
        type: Date,
        default: null
    }
});

// Méthode pour vérifier si le visiteur peut placer un pixel
visitorSchema.methods.canPlacePixel = function(participationDelay) {
    if (!this.lastPixelPlaced) {
        return { canPlace: true };
    }

    const now = new Date();
    const timeSinceLastPlacement = (now.getTime() - this.lastPixelPlaced.getTime()) / 1000;

    if (timeSinceLastPlacement < participationDelay) {
        const timeLeft = Math.ceil(participationDelay - timeSinceLastPlacement);
        return {
            canPlace: false,
            reason: `Vous devez attendre encore ${timeLeft} secondes avant de placer un nouveau pixel`,
            timeLeft
        };
    }

    return { canPlace: true };
};

export const Visitor = mongoose.model("Visitor", visitorSchema);