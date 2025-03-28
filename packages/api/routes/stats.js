import express from "express";
import { User } from "../models/User.js";
import { PixelBoard } from "../models/PixelBoard.js";

const statsRouter = express.Router();

// Route principale pour obtenir toutes les statistiques de base
statsRouter.get("/", async (req, res, next) => {
  try {
    // Récupère le nombre total d'utilisateurs
    const userCount = await User.countDocuments();

    // Récupère le nombre total de PixelBoards
    const pixelBoardCount = await PixelBoard.countDocuments();

    // Récupère le nombre total de pixels placés
    const pixelsResult = await PixelBoard.aggregate([
      {
        $group: {
          _id: null,
          totalPixels: { $sum: { $size: "$pixels" } },
        },
      },
    ]);

    const totalPixels =
      pixelsResult.length > 0 ? pixelsResult[0].totalPixels : 0;

    // Renvoie les statistiques
    res.json({
      userCount,
      pixelBoardCount,
      totalPixels,
    });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir les statistiques utilisateur
statsRouter.get("/users", async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ count: userCount });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir les statistiques des PixelBoards
statsRouter.get("/pixel-boards", async (req, res, next) => {
  try {
    const pixelBoardCount = await PixelBoard.countDocuments();
    res.json({ count: pixelBoardCount });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir le nombre total de pixels
statsRouter.get("/pixels", async (req, res, next) => {
  try {
    const pixelsResult = await PixelBoard.aggregate([
      {
        $group: {
          _id: null,
          totalPixels: { $sum: { $size: "$pixels" } },
        },
      },
    ]);

    const totalPixels =
      pixelsResult.length > 0 ? pixelsResult[0].totalPixels : 0;
    res.json({ count: totalPixels });
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
