import axios from 'axios';
import { User } from '../model/User';

const API_BASE_URL = 'http://localhost:8000/api';

// Configuration globale d'axios pour les cookies
axios.defaults.withCredentials = true;

// Variables pour la gestion du rafraîchissement de token
let isRefreshing = false;
let failedQueue = [];

// Traitement des requêtes en file d'attente
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

// Intercepteur de réponse pour le rafraîchissement des tokens
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Ne pas intercepter les requêtes de rafraîchissement elles-mêmes
        if (originalRequest.url?.includes('/auth/refresh')) {
            // Si l'erreur est sur le rafraîchissement, vider la file d'attente
            if (isRefreshing) {
                isRefreshing = false;
                processQueue(error);
            }
            return Promise.reject(error);
        }

        // Si erreur 401 et requête n'a pas déjà été réessayée
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Si un rafraîchissement est déjà en cours, ajouter la requête à la file d'attente
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return axios(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                // Tenter de rafraîchir le token
                await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true
                });

                // Si rafraîchissement réussi, traiter la file d'attente
                isRefreshing = false;
                processQueue(null);

                // Réessayer la requête originale
                return axios(originalRequest);
            } catch (refreshError) {
                // En cas d'échec du rafraîchissement
                isRefreshing = false;
                processQueue(refreshError);

                // Nettoyer l'état d'authentification
                localStorage.removeItem('isLoggedIn');

                // Rediriger vers la page de connexion gerer par le contexte
                return Promise.reject(refreshError);
            }
        }

        // Pour les autres erreurs, simplement rejeter la promesse
        return Promise.reject(error);
    }
);

class AuthService {
    // Fonction de connexion
    static async login(email, password) {
        try {
            // Appel à l'API de connexion
            await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

            // Marquer l'utilisateur comme connecté
            localStorage.setItem('isLoggedIn', 'true');

            // Récupérer les informations de l'utilisateur
            const userData = await this.getCurrentUser();
            return userData;
        } catch (error) {
            // Gestion des erreurs
            this.handleAuthError(error, 'connexion');
        }
    }

    // Fonction d'inscription
    static async register(name, email, password) {
        try {
            await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
        } catch (error) {
            this.handleAuthError(error, 'inscription');
        }
    }

    // Fonction de déconnexion
    static async logout() {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout`);
            localStorage.removeItem('isLoggedIn');
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            // Même en cas d'erreur, on nettoie le stockage local
            localStorage.removeItem('isLoggedIn');
            throw new Error("Échec de la déconnexion");
        }
    }

    // Obtenir l'utilisateur courant
    static async getCurrentUser() : Promise<User | undefined> {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/me`);
            return response.data as User;
        } catch (error) {
            // Si erreur 401 (non autorisé), l'utilisateur n'est pas connecté
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                return undefined;
            }
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
            return false;
        }
    }

    // Gestion centralisée des erreurs d'authentification
    static handleAuthError(error, operation) {
        if (axios.isAxiosError(error) && error.response) {
            const { data, status } = error.response;

            // Erreurs spécifiques selon le code
            switch(data.error) {
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
                    throw new Error(data.message || `Erreur lors de l'${operation}`);
            }
        }

        throw new Error(`Une erreur est survenue lors de l'${operation}`);
    }
}

export default AuthService;