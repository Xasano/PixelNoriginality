// routes/visitors.js
import express from "express";
import {createVisitorSession, validateVisitorSession, refreshVisitorSession, clearVisitorSession, getVisitorSessionInfo} from "../services/sessionService.js";
import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";
import { authenticateVisitor } from "../middleware/visitorAuth.js";

const visitorRouter = express.Router();

// Middleware pour toutes les routes
visitorRouter.use(authenticateVisitor);

visitorRouter.post("/register", async (req, res, next) => {
    try {
        const visitorId = await createVisitorSession(res);

        res.status(201).json({
            success: true,
            visitorId
        });
    } catch (err) {
        next(err);
    }
});


// Route pour créer une session visiteur
visitorRouter.post("/session", async (req, res, next) => {
    try {
        // Si déjà authentifié comme visiteur, renvoyer la session existante
        if (req.visitor) {
            await refreshVisitorSession(req.visitorId, res);
            return res.json({
                success: true,
                visitorId: req.visitorId,
                message: "Session visiteur existante rafraîchie"
            });
        }

        // Créer une nouvelle session visiteur
        const visitorId = await createVisitorSession(res);

        res.status(201).json({
            success: true,
            visitorId,
            message: "Session visiteur créée"
        });
    } catch (err) {
        next(err);
    }
});

// Route pour vérifier et rafraîchir une session visiteur
visitorRouter.get("/session", async (req, res, next) => {
    try {
        // Si pas de session visiteur, répondre en conséquence
        if (!req.visitor) {
            return res.json({
                success: false,
                authenticated: false,
                message: "Aucune session visiteur active"
            });
        }

        // Rafraîchir la session
        await refreshVisitorSession(req.visitorId, res);
        // Obtenir les informations de session
        const sessionInfo = await getVisitorSessionInfo(req.visitorId);

        res.json({
            success: true,
            authenticated: true,
            session: sessionInfo
        });
    } catch (err) {
        next(err);
    }
});

// Route pour terminer une session visiteur
visitorRouter.delete("/session", async (req, res, next) => {
    try {
        // Si pas de session visiteur, répondre en conséquence
        if (!req.visitor) {
            return res.json({
                success: false,
                message: "Aucune session visiteur à terminer"
            });
        }
        // Supprimer le cookie
        clearVisitorSession(res);
        res.json({
            success: true,
            message: "Session visiteur terminée"
        });
    } catch (err) {
        next(err);
    }
});

export { visitorRouter };