import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import GridBGComponent from "@components/GridBGComponent";
import EditPixelBoardForm from "@components/pixelboard/forms/EditPixelBoardForm";
import { PixelBoardFormData } from "@interfaces/PixelBoardFormData";

const EditPixelBoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier les permissions de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        if (response.data && response.data._id) {
          // Vérifier si l'utilisateur est admin ou l'auteur du PixelBoard
          if (response.data.role !== "admin") {
            // Fetch les détails du PixelBoard pour vérifier l'authorship
            const pixelBoardResponse = await axios.get(
              `http://localhost:8000/api/pixel-boards/${id}`,
              {
                withCredentials: true,
              },
            );

            if (pixelBoardResponse.data.author._id !== response.data._id) {
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
      await axios.put(
        `http://localhost:8000/api/pixel-boards/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      // Rediriger vers la page de détail du PixelBoard
      navigate(`/pixel-board/${id}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message ||
            "Erreur lors de la modification du PixelBoard",
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
