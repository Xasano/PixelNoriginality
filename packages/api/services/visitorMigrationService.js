import { User } from "../models/User.js";
import { Visitor } from "../models/Visitor.js";
import { PixelBoard } from "../models/PixelBoard.js";

export const migrateVisitorToUser = async (visitorId, userId) => {
  try {
    const visitor = await Visitor.findOne({ visitorId });
    if (!visitor) {
      throw new Error("Visiteur non trouvé");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    user.stats.pixelPainted += visitor.pixelsPlacedCount || 0;

    // Si le visiteur a placé des pixels, met à jour lastPixelTouched
    if (visitor.lastPixelPlaced) {
      if (
        !user.stats.lastPixelTouched ||
        new Date(visitor.lastPixelPlaced) >
          new Date(user.stats.lastPixelTouched)
      ) {
        user.stats.lastPixelTouched = visitor.lastPixelPlaced;
      }
    }

    // Trouve tous les PixelBoards où le visiteur a contribué
    const pixelBoardsContributed = new Set();

    //Parcour tous les PixelBoards pour mettre à jour les pixels
    const pixelBoards = await PixelBoard.find({
      "pixels.isVisitor": true,
    });

    for (const board of pixelBoards) {
      let boardUpdated = false;

      // Parcour les pixels du board
      for (let i = 0; i < board.pixels.length; i++) {
        const pixel = board.pixels[i];

        // Identifie les pixels placés par ce visiteur (par coincidence de temps)
        if (
          pixel.isVisitor === true &&
          visitor.lastPixelPlaced &&
          Math.abs(
            new Date(pixel.placedAt) - new Date(visitor.lastPixelPlaced),
          ) < 1000
        ) {
          // Mettre à jour le pixel pour l'associer à l'utilisateur
          board.pixels[i].isVisitor = false;
          board.pixels[i].placedBy = userId;

          boardUpdated = true;
          pixelBoardsContributed.add(board._id);
        }
      }

      // Sauvegarder le PixelBoard si des modifications ont été faites
      if (boardUpdated) {
        await board.save();
      }
    }

    // Met à jour le compteur de PixelBoards auxquels l'utilisateur a participé
    user.stats.pixelBoardsParticipated += pixelBoardsContributed.size;

    //Sauvegarde l'utilisateur
    await user.save();

    //Marque le visiteur comme migré
    visitor.migratedToUser = userId;
    await visitor.save();

    return {
      success: true,
      message: "Migration réussie",
      stats: {
        pixelsConverted: visitor.pixelsPlacedCount || 0,
        boardsContributed: pixelBoardsContributed.size,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    throw error;
  }
};
