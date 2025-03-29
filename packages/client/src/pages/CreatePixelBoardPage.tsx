import React, { useEffect, useState } from "react";
import GridBGComponent from "../components/GridBGComponent";
import { useNavigate } from "react-router";
import { PixelBoardFormData } from "@interfaces/PixelBoardFormData";
import CreatePixelBoardForm from "@components/pixelboard/forms/CreatePixelBoardForm";
import { apiService, isApiError } from "@/helpers/request";
import { User } from "@/interfaces/User";
import { IPixelBoard } from "@/interfaces/PixelBoard";

const CreatePixelBoardPage: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiService.get<User>("/auth/me", {
          withCredentials: true,
        });

        if (data && data._id) {
          setCurrentUserId(data._id);
        } else {
          // Rediriger vers la page de connexion si non connecté
          navigate("/login", {
            state: {
              message: "Vous devez être connecté pour créer un PixelBoard",
            },
          });
        }
      } catch (err) {
        console.error(err);
        // Rediriger vers la page de connexion si erreur d'authentification
        navigate("/login", {
          state: {
            message: "Vous devez être connecté pour créer un PixelBoard",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleCreatePixelBoard = async (formData: PixelBoardFormData) => {
    try {
      // Inclure la date de création et l'ID de l'auteur
      const pixelBoardData = {
        ...formData,
        creationDate: new Date().toISOString(),
        author: currentUserId,
      };

      // Appel API pour créer le PixelBoard
      const data = await apiService.post<IPixelBoard>(
        "/pixel-boards",
        pixelBoardData,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Log pour débogage
      console.log("Réponse de création:", data);

      // Rediriger vers la page du nouveau PixelBoard
      if (data && data._id) {
        navigate(`/pixel-board/${data._id}`);
      } else {
        navigate("/pixel-boards");
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.description || "Erreur lors de la création du PixelBoard");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue s'est produite");
      }
      throw err; // Relance l'erreur pour que le formulaire puisse la gérer
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <GridBGComponent>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}
          <CreatePixelBoardForm onSubmit={handleCreatePixelBoard} />
        </div>
      </div>
    </GridBGComponent>
  );
};

export default CreatePixelBoardPage;
