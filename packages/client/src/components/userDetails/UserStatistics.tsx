import React from "react";
import { User } from "../../interfaces/User";

interface UserStatisticsProps {
  currentUser: User;
  formatDate: (dateString: Date) => string;
}

const UserStatistics: React.FC<UserStatisticsProps> = ({
  currentUser,
  formatDate,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-600 pb-2">
        Statistiques
      </h3>
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Tableaux participés
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentUser.stats.pixelBoardsParticipated}
            </span>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Pixels peints
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentUser.stats.pixelPainted}
            </span>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Dernier pixel peint
            </span>
            <span className="text-gray-800 dark:text-gray-200">
              {currentUser.stats.lastPixelTouched
                ? formatDate(new Date(currentUser.stats.lastPixelTouched))
                : "Jamais"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
