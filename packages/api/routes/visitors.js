// routes/visitors.js
import express from "express";
import {
  createVisitorSession,
  refreshVisitorSession,
  clearVisitorSession,
  getVisitorSessionInfo,
} from "../services/sessionService.js";
import { authenticateVisitor } from "../middleware/visitorAuth.js";

const visitorRouter = express.Router();

// Middleware pour toutes les routes
visitorRouter.use(authenticateVisitor);

visitorRouter.post("/register", async (req, res, next) => {
  try {
    const visitorId = await createVisitorSession(res);

    res.status(201).json({
      success: true,
      visitorId,
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
        message: "Session visiteur existante rafraîchie",
      });
    }

    // Créer une nouvelle session visiteur
    const visitorId = await createVisitorSession(res);

    res.status(201).json({
      success: true,
      visitorId,
      message: "Session visiteur créée",
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
        message: "Aucune session visiteur active",
      });
    }

    // Rafraîchir la session
    await refreshVisitorSession(req.visitorId, res);
    // Obtenir les informations de session
    const sessionInfo = await getVisitorSessionInfo(req.visitorId);

    res.json({
      success: true,
      authenticated: true,
      session: sessionInfo,
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
        message: "Aucune session visiteur à terminer",
      });
    }
    // Supprimer le cookie
    clearVisitorSession(res);
    res.json({
      success: true,
      message: "Session visiteur terminée",
    });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir les informations sur les limitations du visiteur
visitorRouter.get("/limits", async (req, res, next) => {
  try {
    // Si pas de visiteur identifié
    if (!req.visitor) {
      return res.json({
        success: false,
        message: "Aucune session visiteur active",
      });
    }

    // S'assurer que les méthodes et propriétés existent
    if (typeof req.visitor.checkAndResetDailyLimits === "function") {
      req.visitor.checkAndResetDailyLimits();
    }

    // Initialiser les valeurs par défaut si elles n'existent pas
    const dailyPixelsPlaced = req.visitor.dailyPixelsPlaced || 0;
    const lastPixelPlaced = req.visitor.lastPixelPlaced || null;
    const pixelsPlacedCount = req.visitor.pixelsPlacedCount || 0;

    // Sauvegarder le visiteur
    await req.visitor.save();

    // Calculer le temps restant avant le prochain placement possible
    let timeUntilNextPixel = 0;
    if (lastPixelPlaced) {
      const now = new Date();
      const defaultDelay = 60; // Délai par défaut en secondes
      const sinceLastPixel = (now - new Date(lastPixelPlaced)) / 1000;
      timeUntilNextPixel = Math.max(0, defaultDelay - sinceLastPixel);
    }

    // Calculer le temps restant avant la réinitialisation quotidienne
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilReset = Math.floor((tomorrow - now) / 1000);

    const DAILY_PIXEL_LIMIT = 50;

    res.json({
      success: true,
      limits: {
        dailyPixelLimit: DAILY_PIXEL_LIMIT,
        pixelsPlacedToday: dailyPixelsPlaced,
        pixelsRemaining: DAILY_PIXEL_LIMIT - dailyPixelsPlaced,
        timeUntilNextPixel: Math.ceil(timeUntilNextPixel),
        timeUntilDailyReset: timeUntilReset,
        totalPixelsPlaced: pixelsPlacedCount,
      },
      message: "Récupération des limitations réussie",
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des limites:", err);
    next(err);
  }
});

// Route pour obtenir les informations sur les limitations du visiteur
visitorRouter.get("/limits", async (req, res, next) => {
    try {
        // Si pas de visiteur identifié
        if (!req.visitor) {
            return res.json({
                success: false,
                message: "Aucune session visiteur active"
            });
        }

        // S'assurer que les méthodes et propriétés existent
        if (typeof req.visitor.checkAndResetDailyLimits === 'function') {
            req.visitor.checkAndResetDailyLimits();
        }

        // Initialiser les valeurs par défaut si elles n'existent pas
        const dailyPixelsPlaced = req.visitor.dailyPixelsPlaced || 0;
        const lastPixelPlaced = req.visitor.lastPixelPlaced || null;
        const pixelsPlacedCount = req.visitor.pixelsPlacedCount || 0;

        // Sauvegarder le visiteur
        await req.visitor.save();

        // Calculer le temps restant avant le prochain placement possible
        let timeUntilNextPixel = 0;
        if (lastPixelPlaced) {
            const now = new Date();
            const defaultDelay = 60; // Délai par défaut en secondes
            const sinceLastPixel = (now - new Date(lastPixelPlaced)) / 1000;
            timeUntilNextPixel = Math.max(0, defaultDelay - sinceLastPixel);
        }

        // Calculer le temps restant avant la réinitialisation quotidienne
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const timeUntilReset = Math.floor((tomorrow - now) / 1000);

        const DAILY_PIXEL_LIMIT = 50;

        res.json({
            success: true,
            limits: {
                dailyPixelLimit: DAILY_PIXEL_LIMIT,
                pixelsPlacedToday: dailyPixelsPlaced,
                pixelsRemaining: DAILY_PIXEL_LIMIT - dailyPixelsPlaced,
                timeUntilNextPixel: Math.ceil(timeUntilNextPixel),
                timeUntilDailyReset: timeUntilReset,
                totalPixelsPlaced: pixelsPlacedCount
            },
            message: "Récupération des limitations réussie"
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des limites:", err);
        next(err);
    }
});

export { visitorRouter };
