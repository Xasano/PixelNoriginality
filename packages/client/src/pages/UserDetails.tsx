import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GridBGComponent from "@components/GridBGComponent";
import UserAccountDetails from "@components/userDetails/UserAccountDetails";
import UserActionButtons from "@components/userDetails/UserActionButtons";
import UserProfileHeader from "@components/userDetails/UserProfileHeader";
import UserStatistics from "@components/userDetails/UserStatistics";
import { User } from "@interfaces/User";
import { apiService, isApiError } from "@/helpers/request";

const UserDetailsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiService.get<User>("/auth/me");

        if (data && data._id) {
          setCurrentUser(data);
        }
      } catch (error) {
        if (isApiError(error)) {
          setError(
            error.description ||
              "Une erreur s'est produite lors de la récupération des données de l'utilisateur",
          );
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Une erreur innatendue s'est produite");
        }
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Formatage des dates pour un affichage plus convivial
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handlers de navigation
  const handleNavigateToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <GridBGComponent>
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">
              Erreur
            </h1>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <button
              onClick={handleNavigateToHome}
              className="mt-6 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </GridBGComponent>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <GridBGComponent>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">
            Mon Compte
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <UserProfileHeader currentUser={currentUser} />
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <UserAccountDetails
                currentUser={currentUser}
                formatDate={formatDate}
              />
              <UserStatistics
                currentUser={currentUser}
                formatDate={formatDate}
              />
            </div>
            <UserActionButtons
              handleNavigateToHome={handleNavigateToHome}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </GridBGComponent>
  );
};

export default UserDetailsPage;
