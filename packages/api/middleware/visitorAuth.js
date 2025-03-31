import { Visitor } from "../models/Visitor.js";
// Middleware pour authentifier un visiteur via son cookie
export const authenticateVisitor = async (req, res, next) => {
  try {
    // Vérifie si un visitorId existe dans les cookies
    const visitorId = req.cookies.visitorId;

    if (!visitorId) {
      // Pas d'ID visiteur, passer au middleware suivant
      return next();
    }
    // Vérifie si l'ID visiteur existe dans la base de données
    const visitor = await Visitor.findOne({ visitorId });

    if (!visitor) {
      // ID visiteur invalide, supprimer le cookie
      res.clearCookie("visitorId");
      return next();
    }
    // Mettre à jour la dernière connexion
    visitor.lastConnection = new Date();
    await visitor.save();
    // Ajoute l'information visiteur à la requête
    req.visitor = visitor;
    req.visitorId = visitorId;

    // Prolonge la durée du cookie
    res.cookie("visitorId", visitorId, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      httpOnly: true,
      sameSite: "strict",
    });

    next();
  } catch (err) {
    console.error("Erreur d'authentification visiteur:", err);
    // En cas d'erreur, continuer sans authentification visiteur
    next();
  }
};
