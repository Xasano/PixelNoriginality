import { IPixelBoard } from "@interfaces/PixelBoard";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

class PixelBoardService {
  // Récupérer les PixelBoards actifs
  static async getActivePixelBoards(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pixel-boards`, {
        params: {
          status: "active",
          page,
          limit,
          sortBy: "creationDate",
          sortOrder: "desc",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des PixelBoards actifs:",
        error,
      );
      throw error;
    }
  }

  // Récupérer un PixelBoard par son ID
  static async getPixelBoardById(id: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pixel-boards/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du PixelBoard ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Vérifier si un PixelBoard est actif
  static isActiveBoard(board: IPixelBoard) {
    if (!board || board.status !== "active") return false;
    const now = new Date();
    const endDate = new Date(board.endDate);
    return endDate > now;
  }

  // Filtrer les PixelBoards actifs
  static filterActiveBoards(boards: IPixelBoard[]) {
    if (!boards || !Array.isArray(boards)) return [];
    const now = new Date();
    return boards.filter(
      (board) => board.status === "active" && new Date(board.endDate) > now,
    );
  }
}

export default PixelBoardService;
