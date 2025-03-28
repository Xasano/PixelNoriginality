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

// Méthode qui verifie si le visiteur peut placer un pixel
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

// Méthode qui verifie si la session est active
visitorSchema.methods.isSessionActive = function() {
    const now = new Date();
    const lastActivity = this.lastConnection || this.createdAt;

    const inactiveThreshold = 24 * 60 * 60 * 1000; // 24h en ms

    return (now.getTime() - lastActivity.getTime()) < inactiveThreshold;
};

// Méthode qui permet de nettoyer les anciennes sessions (utilité administrative)
visitorSchema.statics.cleanupInactiveSessions = async function(thresholdDays = 7) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const result = await this.deleteMany({
        lastConnection: { $lt: thresholdDate }
    });
    return result.deletedCount;
};

export const Visitor = mongoose.model("Visitor", visitorSchema);