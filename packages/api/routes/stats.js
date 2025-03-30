import express from "express";
import { User } from "../models/User.js";
import { PixelBoard } from "../models/PixelBoard.js";
import { Contribution } from "../models/Contribution.js";

const statsRouter = express.Router();

// Route principale pour obtenir toutes les statistiques de base
statsRouter.get("/", async (req, res, next) => {
  try {
    // Récupère le nombre total d'utilisateurs
    const userCount = await User.countDocuments();

    // Récupère le nombre total de PixelBoards
    const pixelBoardCount = await PixelBoard.countDocuments();

    // Récupère le nombre total de pixels placés
    const contributionCount = await Contribution.countDocuments();

    // Renvoie les statistiques
    res.json({
      userCount,
      pixelBoardCount,
      contributionCount,
    });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir le nombre d'utilisateur
statsRouter.get("/users", async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ count: userCount });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir le nombre de PixelBoards
statsRouter.get("/pixel-boards", async (req, res, next) => {
  try {
    const pixelBoardCount = await PixelBoard.countDocuments();
    res.json({ count: pixelBoardCount });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir le nombre total de pixels
statsRouter.get("/contributions", async (req, res, next) => {
  try {
    const contributionCount = await Contribution.countDocuments();
    console.log("Nombre de contributions :", contributionCount);
    res.json({ count: contributionCount });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir les PixelBoards récents (actifs et terminés)
statsRouter.get("/recent-boards", async (req, res, next) => {
  try {
    // Récupère les 5 derniers PixelBoards actifs
    const activePixelBoards = await PixelBoard.find({ status: "active" })
      .sort({ creationDate: -1 })
      .limit(5)
      .populate("author", "name")
      .exec();

    // Récupère les 5 derniers PixelBoards terminés
    const completedPixelBoards = await PixelBoard.find({ status: "completed" })
      .sort({ endDate: -1 })
      .limit(5)
      .populate("author", "name")
      .exec();

    res.json({
      active: activePixelBoards,
      completed: completedPixelBoards,
    });
  } catch (err) {
    next(err);
  }
});

export { statsRouter };
