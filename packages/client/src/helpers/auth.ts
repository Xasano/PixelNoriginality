import { User } from "../interfaces/User";
import { apiService, isApiError } from "./request";

class AuthService {
  // Fonction de connexion
  static async login(email: string, password: string) {
    try {
      // Appel à l'API de connexion
      await apiService.post(`/auth/login`, { email, password });

      // Marquer l'utilisateur comme connecté
      localStorage.setItem("isLoggedIn", "true");

      // Récupérer les informations de l'utilisateur
      const userData = await this.getCurrentUser();
      return userData;
    } catch (error) {
      // Gestion des erreurs
      this.handleAuthError(error, "connexion");
    }
  }

  // Fonction d'inscription
  static async register(name: string, email: string, password: string) {
    try {
      await apiService.post(`/auth/register`, {
        name,
        email,
        password,
      });
    } catch (error) {
      this.handleAuthError(error, "inscription");
    }
  }

  // Fonction de déconnexion
  static async logout() {
    try {
      await apiService.post(`/auth/logout`);
      localStorage.removeItem("isLoggedIn");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, on nettoie le stockage local
      localStorage.removeItem("isLoggedIn");
      throw new Error("Échec de la déconnexion");
    }
  }

  // Obtenir l'utilisateur courant
  static async getCurrentUser(): Promise<User | undefined> {
    try {
      return await apiService.get<User>(`/auth/me`);
    } catch (error) {
      // Logguer d'autres types d'erreurs pour le débogage
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return undefined;
    }
  }

  // Vérifier si l'utilisateur est admin
  static async isAdmin() {
    try {
      const user = await this.getCurrentUser();
      return user?.role === "admin" || false;
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle admin:", error);
      return false;
    }
  }

  // Gestion centralisée des erreurs d'authentification
  static handleAuthError(error: unknown, operation: string) {
    if (isApiError(error)) {
      // Erreurs spécifiques selon le code
      switch (error.error) {
        case "EMAIL_ALREADY_REGISTERED":
          throw new Error("Cet email est déjà utilisé.");
        case "USERNAME_ALREADY_TAKEN":
          throw new Error("Ce nom d'utilisateur est déjà pris.");
        case "INVALID_EMAIL_FORMAT":
          throw new Error("Format d'email invalide.");
        case "WEAK_PASSWORD":
          throw new Error("Mot de passe trop faible.");
        case "WRONG_EMAIL_OR_PASSWORD":
          throw new Error("Email ou mot de passe incorrect");
        default:
          throw new Error(error.description || `Erreur lors de l'${operation}`);
      }
    }

    throw new Error(`Une erreur est survenue lors de l'${operation}`);
  }
}

export default AuthService;
