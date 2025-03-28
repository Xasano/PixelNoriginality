import { Visitor } from "../models/Visitor.js";
import crypto from "crypto";

export const generateVisitorId = async () => {
    try {
        // Génère un UUID unique
        const visitorId = crypto.randomUUID();

        // Crée un nouveau document visiteur
        const visitor = new Visitor({ visitorId });
        await visitor.save();

        return visitorId;
    } catch (error) {
        console.error("Erreur lors de la génération d'ID visiteur:", error);
        throw new Error("Impossible de générer un ID visiteur");
    }
};

export const getVisitorById = async (visitorId) => {
    try {
        const visitor = await Visitor.findOne({ visitorId });
        return visitor;
    } catch (error) {
        console.error("Erreur lors de la récupération du visiteur:", error);
        return null;
    }
};

export const updateVisitorLastConnection = async (visitorId) => {
    try {
        await Visitor.findOneAndUpdate(
            { visitorId },
            { lastConnection: new Date() }
        );
        return true;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de lastConnection:", error);
        return false;
    }
};

export const updateVisitorPixelPlaced = async (visitorId) => {
    try {
        await Visitor.findOneAndUpdate(
            { visitorId },
            { lastPixelPlaced: new Date() }
        );
        return true;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de lastPixelPlaced:", error);
        return false;
    }
};