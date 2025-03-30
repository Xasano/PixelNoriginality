import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Config
const API_URL = "http://localhost:8000/api";
const REFRESH_ENDPOINT = "/auth/refresh";

// Interface étendue pour ajouter la propriété _retry
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export interface ApiError {
  error: string;
  status: number;
  description: string;
  name: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: (() => void)[] = [];

  constructor() {
    // Création de l'instance Axios
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Important pour envoyer et recevoir des cookies
    this.axiosInstance.defaults.withCredentials = true;

    // Configuration de l'intercepteur de réponse pour le refresh
    this.setupResponseInterceptor();
  }

  // Configure l'intercepteur pour gérer les erreurs 401 et refresher le token
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Si pas de config ou requête annulée, on rejette simplement
        if (!error.config) {
          console.warn("No config in error object", error);
          return Promise.reject(this.formatError(error));
        }

        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        const isRetry = originalRequest._retry === true;

        // Vérifiez si c'est une erreur 401 (unauthorized) et que ce n'est pas déjà une tentative de retry
        if (error.response?.status === 401 && !isRetry) {
          console.log("Token expired, attempting refresh");

          // Si on est déjà en train de refresher, on ajoute cette requête à la file d'attente
          if (this.isRefreshing) {
            console.log("Refresh already in progress, adding to queue");
            return new Promise<AxiosResponse>((resolve, _reject) => {
              this.refreshSubscribers.push(() => {
                // On réessaie la requête originale
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          // On flag qu'on est en train de refresher
          this.isRefreshing = true;
          originalRequest._retry = true;

          try {
            // Tentative de refresh
            console.log("Starting token refresh");
            await this.refreshToken();

            // En cas de succès, on notify tous les subscribers en attente
            console.log("Token refreshed successfully");
            this.onRefreshSuccess();

            // On réessaie la requête originale
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // En cas d'échec du refresh, on notifie tous les subscribers
            console.error("Token refresh failed", refreshError);
            this.onRefreshFailure();
            return Promise.reject(this.formatError(refreshError));
          } finally {
            this.isRefreshing = false;
          }
        }

        // Pour toutes les autres erreurs, on les formate et on les rejette
        return Promise.reject(this.formatError(error));
      },
    );
  }

  // Helper pour formater les erreurs de manière cohérente
  private formatError(error: unknown): ApiError {
    if (error instanceof AxiosError && error.response) {
      // Si c'est une erreur Axios avec une réponse du serveur
      return {
        error: error.code || "axios_error",
        status: error.response.status,
        description:
          error.response.data?.message ||
          error.message ||
          "Une erreur est survenue",
        name: "ApiError",
      };
    } else if (error instanceof Error) {
      // Si c'est une erreur JS standard
      return {
        error: "client_error",
        status: 0,
        description: error.message,
        name: error.name,
      };
    } else if (isApiError(error)) {
      // Si c'est déjà une ApiError, on la retourne telle quelle
      return error;
    } else {
      // Fallback pour les erreurs inconnues
      return {
        error: "unknown_error",
        status: 0,
        description: "Une erreur inconnue est survenue",
        name: "UnknownError",
      };
    }
  }

  // Méthode générique pour faire une requête avec un type de retour spécifié
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance(config);
    return response.data as T;
  }

  // Méthodes spécifiques pour chaque type de requête HTTP
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "get", url });
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "post", url, data });
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "put", url, data });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "delete", url });
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "patch", url, data });
  }

  // Méthode pour rafraîchir le token
  private async refreshToken(): Promise<void> {
    try {
      console.log("Calling refresh endpoint");

      // Important: utiliser une nouvelle instance d'axios pour le refresh
      // pour éviter une boucle infinie avec les intercepteurs
      await axios({
        method: "post",
        url: `${API_URL}${REFRESH_ENDPOINT}`,
        // Pas besoin d'envoyer le refreshToken, il est déjà dans les cookies
        withCredentials: true, // Important pour envoyer et recevoir les cookies
      });

      console.log("Refresh successful");
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }

  // Méthode appelée après un refresh réussi
  private onRefreshSuccess(): void {
    // Notifier tous les subscribers en attente
    this.refreshSubscribers.forEach((callback) => callback());
    this.refreshSubscribers = [];
  }

  // Méthode appelée après un échec de refresh
  private onRefreshFailure(): void {
    console.warn("Refresh token failed, notifying subscribers");

    // Vider les subscribers
    this.refreshSubscribers = [];
  }
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "error" in err &&
    "status" in err &&
    "description" in err &&
    "name" in err
  );
}

// Export d'une instance unique du service
export const apiService = new ApiService();
