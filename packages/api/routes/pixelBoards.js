import express from "express";
import { PixelBoard } from "../models/PixelBoard.js";
import { authenticateToken } from "../middleware/token.js";
import { ApiError, ApiErrorException } from "../exceptions/ApiErrors.js";

// Middleware pour vérifier si l'utilisateur est administrateur
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        throw new ApiErrorException(ApiError.FORBIDDEN, 403, "Accès réservé aux administrateurs");
    }
    next();
};

// Route pour placer un pixel sur un PixelBoard
const placePixelRoute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { x, y, color } = req.body;
        const userId = req.user.id;

        // Valide les paramètres requis
        if (x === undefined || y === undefined || !color) {
            throw new ApiErrorException(ApiError.BAD_REQUEST, 400, "Coordonnées et couleur requises");
        }

        // Recherche le PixelBoard
        const pixelBoard = await PixelBoard.findById(id);
        if (!pixelBoard) {
            throw new ApiErrorException(ApiError.NOT_FOUND, 404);
        }

        // Vérifie si l'utilisateur peut placer un pixel
        const canPlace = pixelBoard.canUserPlacePixel(userId);
        if (!canPlace.canPlace) {
            throw new ApiErrorException(ApiError.FORBIDDEN, 403, canPlace.reason);
        }

        // Place le pixel
        pixelBoard.placePixel(parseInt(x), parseInt(y), color, userId);
        await pixelBoard.save();

        res.json({
            success: true,
            message: "Pixel placé avec succès",
            boardId: pixelBoard._id,
            pixel: {
                x,
                y,
                color
            }
        });
    } catch (err) {
        next(err);
    }
};

const pixelBoardRouter = express.Router();

// Récupère tous les PixelBoards
pixelBoardRouter.get("/", async (req, res, next) => {
    try {
        const {
            status,
            author,
            page = 1,
            limit = 10,
            sortBy = "creationDate",
            sortOrder = "desc"
        } = req.query;

        // Construire la requête de filtrage
        const query = {};

        if (status) {
            query.status = status;
        }

        if (author) {
            query.author = author;
        }

        // Options de tri
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Calcul du décalage pour la pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Exécute la requête avec la pagination
        const pixelBoards = await PixelBoard.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("author", "name")
            .exec();

        // Compte le nombre total de documents pour la pagination
        const total = await PixelBoard.countDocuments(query);

        res.json({
            data: pixelBoards,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        next(err);
    }
});

// Récupère un PixelBoard par son ID
pixelBoardRouter.get("/:id", async (req, res, next) => {
    try {
        const pixelBoard = await PixelBoard.findById(req.params.id)
            .populate("author", "name")
            .exec();

        if (!pixelBoard) {
            throw new ApiErrorException(ApiError.NOT_FOUND, 404);
        }

        res.json(pixelBoard);
    } catch (err) {
        next(err);
    }
});

// Créer un nouveau PixelBoard
pixelBoardRouter.post("/", authenticateToken, async (req, res, next) => {
    try {
        const {
            title,
            status,
            endDate,
            width,
            height,
            allowOverwriting,
            participationDelay
        } = req.body;

        // Validation des champs obligatoires
        if (!title || !endDate) {
            throw new ApiErrorException(ApiError.BAD_REQUEST, 400, "Titre et date de fin sont obligatoires");
        }

        // Validation des dimensions
        if (width < 4 || width > 64 || height < 4 || height > 64) {
            throw new ApiErrorException(
                ApiError.BAD_REQUEST,
                400,
                "Les dimensions doivent être entre 4 et 64 pixels"
            );
        }

        // Validation de la date de fin
        const endDateObj = new Date(endDate);
        if (endDateObj <= new Date()) {
            throw new ApiErrorException(
                ApiError.BAD_REQUEST,
                400,
                "La date de fin doit être dans le futur"
            );
        }

        // Validation du délai de participation
        if (participationDelay < 10) {
            throw new ApiErrorException(
                ApiError.BAD_REQUEST,
                400,
                "Le délai entre participations doit être d'au moins 10 secondes"
            );
        }

        // Créer le PixelBoard
        const pixelBoard = new PixelBoard({
            title,
            status: status || "draft",
            endDate: endDateObj,
            width,
            height,
            author: req.user.id,
            allowOverwriting: allowOverwriting || false,
            participationDelay,
            pixels: []
        });

        // Enregistrer le PixelBoard
        await pixelBoard.save();

        res.status(201).json(pixelBoard);
    } catch (err) {
        next(err);
    }
});

// Mettre à jour un PixelBoard existant
pixelBoardRouter.put("/:id", authenticateToken, async (req, res, next) => {
    try {
        const pixelBoard = await PixelBoard.findById(req.params.id);

        if (!pixelBoard) {
            throw new ApiErrorException(ApiError.NOT_FOUND, 404);
        }

        // Vérifier si l'utilisateur est l'auteur du PixelBoard ou un administrateur
        const isAdmin = req.user.role === "admin";
        if (pixelBoard.author.toString() !== req.user.id && !isAdmin) {
            throw new ApiErrorException(ApiError.FORBIDDEN, 403, "Vous n'êtes pas autorisé à modifier ce PixelBoard");
        }

        // Vérifier si le PixelBoard est déjà terminé
        if (pixelBoard.status === "completed" && !isAdmin) {
            throw new ApiErrorException(ApiError.BAD_REQUEST, 400, "Impossible de modifier un PixelBoard terminé");
        }

        const {
            title,
            status,
            endDate,
            allowOverwriting,
            participationDelay
        } = req.body;

        // Mise à jour des champs modifiables
        if (title) pixelBoard.title = title;
        if (status) {
            // Seul l'admin peut définir un statut "completed" manuellement
            if (status === "completed" && !isAdmin) {
                throw new ApiErrorException(ApiError.FORBIDDEN, 403, "Seul un administrateur peut définir un PixelBoard comme terminé");
            }
            pixelBoard.status = status;
        }

        if (endDate) {
            const endDateObj = new Date(endDate);
            if (endDateObj <= new Date() && !isAdmin) {
                throw new ApiErrorException(ApiError.BAD_REQUEST, 400, "La date de fin doit être dans le futur");
            }
            pixelBoard.endDate = endDateObj;
        }

        // Les dimensions ne sont pas modifiables une fois le PixelBoard créé
        if (allowOverwriting !== undefined) pixelBoard.allowOverwriting = allowOverwriting;

        if (participationDelay) {
            if (participationDelay < 10 && !isAdmin) {
                throw new ApiErrorException(
                    ApiError.BAD_REQUEST,
                    400,
                    "Le délai entre participations doit être d'au moins 10 secondes"
                );
            }
            pixelBoard.participationDelay = participationDelay;
        }

        // Enregistrer les modifications
        await pixelBoard.save();

        res.json(pixelBoard);
    } catch (err) {
        next(err);
    }
});

// Route pour placer un pixel
pixelBoardRouter.post("/:id/pixels", authenticateToken, placePixelRoute);

// Obtenir des statistiques sur un PixelBoard
pixelBoardRouter.get("/:id/stats", async (req, res, next) => {
    try {
        const pixelBoard = await PixelBoard.findById(req.params.id);

        if (!pixelBoard) {
            throw new ApiErrorException(ApiError.NOT_FOUND, 404);
        }

        // Calcul des statistiques
        const totalPixels = pixelBoard.pixels.length;
        const totalPossiblePixels = pixelBoard.width * pixelBoard.height;
        const completionPercentage = (totalPixels / totalPossiblePixels) * 100;

        // Obtenir les contributeurs uniques
        const contributorIds = pixelBoard.getContributors();
        const contributorCount = contributorIds.length;

        // Calcul le temps restant
        const now = new Date();
        const timeRemainingMs = pixelBoard.endDate.getTime() - now.getTime();
        const timeRemainingDays = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24)));

        res.json({
            totalPixels,
            totalPossiblePixels,
            completionPercentage,
            contributorCount,
            timeRemainingDays,
            isActive: pixelBoard.status === "active" && now < pixelBoard.endDate
        });
    } catch (err) {
        next(err);
    }
});

// Supprimer un PixelBoard - accessible aux auteurs ou aux administrateurs
pixelBoardRouter.delete("/:id", authenticateToken, async (req, res, next) => {
    try {
        const pixelBoard = await PixelBoard.findById(req.params.id);

        if (!pixelBoard) {
            throw new ApiErrorException(ApiError.NOT_FOUND, 404);
        }

        // Vérifier si l'utilisateur est l'auteur du PixelBoard ou un administrateur
        const isAdmin = req.user.role === "admin";
        if (pixelBoard.author.toString() !== req.user.id && !isAdmin) {
            throw new ApiErrorException(ApiError.FORBIDDEN, 403, "Vous n'êtes pas autorisé à supprimer ce PixelBoard");
        }

        await PixelBoard.findByIdAndDelete(req.params.id);

        res.status(204).send();
    } catch (err) {
        next(err);
    }
});


// Route pour supprimer tous les PixelBoards (uniquement admin)
pixelBoardRouter.delete("/", authenticateToken, requireAdmin, async (req, res, next) => {
    try {
        const result = await PixelBoard.deleteMany({});
        res.json({
            success: true,
            message: `${result.deletedCount} PixelBoards supprimés`,
        });
    } catch (err) {
        next(err);
    }
});

// Route pour modifier le statut de plusieurs PixelBoards (uniquement admin)
pixelBoardRouter.put("/batch/status", authenticateToken, requireAdmin, async (req, res, next) => {
    try {
        const { ids, status } = req.body;

        if (!ids || !Array.isArray(ids) || !status) {
            throw new ApiErrorException(ApiError.BAD_REQUEST, 400, "Liste d'IDs et statut requis");
        }

        const result = await PixelBoard.updateMany(
            { _id: { $in: ids } },
            { $set: { status } }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} PixelBoards modifiés`,
        });
    } catch (err) {
        next(err);
    }
});

// Route pour prolonger la date de fin de plusieurs PixelBoards (uniquement admin)
pixelBoardRouter.put("/batch/extend", authenticateToken, requireAdmin, async (req, res, next) => {
    try {
        const { ids, days } = req.body;

        if (!ids || !Array.isArray(ids) || !days || isNaN(days)) {
            throw new ApiErrorException(ApiError.BAD_REQUEST, 400, "Liste d'IDs et nombre de jours requis");
        }

        const pixelBoards = await PixelBoard.find({ _id: { $in: ids } });

        const updatePromises = pixelBoards.map(board => {
            const newEndDate = new Date(board.endDate);
            newEndDate.setDate(newEndDate.getDate() + parseInt(days));
            return PixelBoard.updateOne(
                { _id: board._id },
                { $set: { endDate: newEndDate } }
            );
        });

        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: `${pixelBoards.length} PixelBoards mis à jour`,
        });
    } catch (err) {
        next(err);
    }
});

export { pixelBoardRouter, requireAdmin };