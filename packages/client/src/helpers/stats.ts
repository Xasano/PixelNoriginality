import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

class StatsService {
  //Récupère toutes les statistiques globales

  static async getGlobalStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  // Récupère uniquement le nombre d'utilisateurs

  static async getUserCount() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/users`, {
        withCredentials: true,
      });
      return response.data.count;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre d'utilisateurs:",
        error,
      );
      throw error;
    }
  }

  // Récupère uniquement le nombre de PixelBoards
  static async getPixelBoardCount() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/pixel-boards`, {
        withCredentials: true,
      });
      return response.data.count;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de PixelBoards:",
        error,
      );
      throw error;
    }
  }

  //Récupère uniquement le nombre total de pixels
  static async getPixelCount() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/pixels`, {
        withCredentials: true,
      });
      return response.data.count;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de pixels:",
        error,
      );
      throw error;
    }
  }

  //Récupère les PixelBoards récents (actifs et terminés)
  static async getRecentBoards() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/recent-boards`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des tableaux récents:",
        error,
      );
      throw error;
    }
  }
}

export default StatsService;
