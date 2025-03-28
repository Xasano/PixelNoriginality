import express from "express";
import { generateVisitorId, getVisitorById, updateVisitorLastConnection } from "../services/visitorService.js";
import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";

const visitorRouter = express.Router();

// Route pour obtenir un nouvel ID visiteur
visitorRouter.post("/register", async (req, res, next) => {
    try {
        const visitorId = await generateVisitorId();

        // Configurer le cookie
        res.cookie("visitorId", visitorId, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            httpOnly: true,
            sameSite: "strict"
        });

        res.status(201).json({
            success: true,
            visitorId
        });
    } catch (err) {
        next(err);
    }
});

// Route pour vérifier un ID visiteur
visitorRouter.get("/verify/:visitorId", async (req, res, next) => {
    try {
        const { visitorId } = req.params;

        if (!visitorId) {
            throw new ApiErrorException(ApiError.BAD_REQUEST, 400);
        }

        const visitor = await getVisitorById(visitorId);

        if (!visitor) {
            throw new ApiErrorException(ApiError.NOT_FOUND, 404);
        }

        // Mettre à jour la dernière connexion
        await updateVisitorLastConnection(visitorId);
        res.json({
            success: true,
            visitorId: visitor.visitorId,
            createdAt: visitor.createdAt,
            lastConnection: visitor.lastConnection
        });
    } catch (err) {
        next(err);
    }
});

export { visitorRouter };