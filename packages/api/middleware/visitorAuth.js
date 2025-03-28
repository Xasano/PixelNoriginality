import { getVisitorById, updateVisitorLastConnection } from "../services/visitorService.js";

export const authenticateVisitor = async (req, res, next) => {
    try {
        // Vérifie si un visitorId existe dans les cookies
        const visitorId = req.cookies.visitorId;

        if (!visitorId) {
            // Pas d'ID visiteur, passer au middleware suivant
            return next();
        }
        // Vérifie si l'ID visiteur existe dans la base de données
        const visitor = await getVisitorById(visitorId);

        if (!visitor) {
            // ID visiteur invalide, supprimer le cookie
            res.clearCookie("visitorId");
            return next();
        }
        // Mettre à jour la dernière connexion
        await updateVisitorLastConnection(visitorId);
        // Ajoute l'information visiteur à la requête
        req.visitor = visitor;
        req.visitorId = visitorId;
        next();
    } catch (err) {
        console.error("Erreur d'authentification visiteur:", err);
        // En cas d'erreur, continue sans authentification visiteur
        next();
    }
};