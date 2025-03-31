import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import GridBGComponent from "@components/GridBGComponent";
import EditPixelBoardForm from "@components/pixelboard/forms/EditPixelBoardForm";
import { PixelBoardFormData } from "@interfaces/PixelBoardFormData";
import { apiService, isApiError } from "@/helpers/request";
import { User } from "@/interfaces/User";
import { IPixelBoard } from "@/interfaces/PixelBoard";

const EditPixelBoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier les permissions de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiService.get<User>("/auth/me");

        if (data && data._id) {
          // Vérifier si l'utilisateur est admin ou l'auteur du PixelBoard
          if (data.role !== "admin") {
            // Fetch les détails du PixelBoard pour vérifier l'authorship
            const pixelBoardResponse = await apiService.get<IPixelBoard>(
              `/pixel-boards/${id}`,
              {
                withCredentials: true,
              },
            );

            if (pixelBoardResponse.author._id !== data._id) {
              // Rediriger si non autorisé
              navigate("/pixel-boards", {
                state: {
                  message: "Vous n'êtes pas autorisé à modifier ce PixelBoard",
                },
              });
            }
          }
        } else {
          // Rediriger vers la page de connexion si non connecté
          navigate("/login", {
            state: {
              message: "Vous devez être connecté pour modifier un PixelBoard",
            },
          });
        }
      } catch (err) {
        console.error(err);
        // Rediriger vers la page de connexion si erreur d'authentification
        navigate("/login", {
          state: {
            message: "Vous devez être connecté pour modifier un PixelBoard",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, id]);

  const handleEditPixelBoard = async (formData: PixelBoardFormData) => {
    try {
      const response = await apiService.put<IPixelBoard>(
        `/pixel-boards/${id}`,
        formData,
      );

      // Rediriger vers la page de détail du PixelBoard
      if (response && response.status === "active") {
        navigate(`/pixel-board/${id}`);
      } else {
        navigate(`/pixel-boards`);
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(
          err.description || "Erreur lors de la modification du PixelBoard",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue s'est produite");
      }
      throw err;
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
          <EditPixelBoardForm onSubmit={handleEditPixelBoard} />
        </div>
      </div>
    </GridBGComponent>
  );
};

export default EditPixelBoardPage;
