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
    },
    pixelsPlacedCount: {
        type: Number,
        default: 0
    },
    lastRequest: {
        type: Date,
        default: null
    },
    requestCount: {
        type: Number,
        default: 0
    },
    // Limite de pixels par jour
    dailyPixelsPlaced: {
        type: Number,
        default: 0
    },
    lastDailyReset: {
        type: Date,
        default: () => new Date().setHours(0, 0, 0, 0) // Minuit du jour actuel
    }

});

// Méthode qui verifie si le visiteur peut placer un pixel
visitorSchema.methods.canPlacePixel = function(participationDelay) {
    // Vérifier d'abord si le visiteur a dépassé sa limite quotidienne
    this.checkAndResetDailyLimits();

    const DAILY_PIXEL_LIMIT = 50; // Maximum 50 pixels par jour pour un visiteur
    if (this.dailyPixelsPlaced >= DAILY_PIXEL_LIMIT) {
        return {
            canPlace: false,
            reason: `Vous avez atteint la limite de ${DAILY_PIXEL_LIMIT} pixels par jour. Revenez demain ou créez un compte.`
        };
    }

    // Vérification du délai comme avant
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


// Méthode pour vérifier et réinitialiser les limites quotidiennes
visitorSchema.methods.checkAndResetDailyLimits = function() {
    const now = new Date();
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    if (!this.lastDailyReset || new Date(this.lastDailyReset) < todayMidnight) {
        this.dailyPixelsPlaced = 0;
        this.lastDailyReset = todayMidnight;
    }
};

// Méthode pour enregistrer un placement de pixel
visitorSchema.methods.recordPixelPlacement = async function() {
    this.checkAndResetDailyLimits();

    this.lastPixelPlaced = new Date();
    this.pixelsPlacedCount = (this.pixelsPlacedCount || 0) + 1;
    this.dailyPixelsPlaced = (this.dailyPixelsPlaced || 0) + 1;

    return this.save();
};

// Méthode pour vérifier le rate limiting
visitorSchema.methods.checkRateLimit = async function(maxRequestsPerMinute) {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Si la dernière requête a été faite il y a moins d'une minute
    if (this.lastRequest && new Date(this.lastRequest) > oneMinuteAgo) {
        // Incrémenter le compteur
        this.requestCount = (this.requestCount || 0) + 1;

        // Vérifier si la limite est dépassée
        if (this.requestCount > maxRequestsPerMinute) {
            return {
                allowed: false,
                reason: `Trop de requêtes. Limite: ${maxRequestsPerMinute}/minute. Réessayez plus tard.`
            };
        }
    } else {
        // Réinitialiser le compteur si la dernière requête date de plus d'une minute
        this.requestCount = 1;
    }

    // Mettre à jour la date de dernière requête
    this.lastRequest = now;
    await this.save();

    return { allowed: true };
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