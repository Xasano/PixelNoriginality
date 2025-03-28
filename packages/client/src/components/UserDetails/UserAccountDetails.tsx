import React from "react";
import { User } from "../../interfaces/User";

const parseDate = (dateString: string): Date => new Date(dateString);

interface UserAccountDetailsProps {
  currentUser: User;
  formatDate: (dateString: Date) => string;
}

const UserAccountDetails: React.FC<UserAccountDetailsProps> = ({
  currentUser,
  formatDate,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-600 pb-2">
        Informations du compte
      </h3>
      <ul className="space-y-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <li className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Date de création
          </span>
          <span className="text-gray-800 dark:text-gray-200">
            {formatDate(parseDate(currentUser.createdAt))}
          </span>
        </li>
        <li className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Date de dernière connexion
          </span>
          <span className="text-gray-800 dark:text-gray-200">
            {formatDate(parseDate(currentUser.lastConnection))}
          </span>
        </li>
        <li className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Thème préféré
          </span>
          <span className="text-gray-800 dark:text-gray-200">
            {currentUser.prefTheme === "dark"
              ? "Sombre"
              : currentUser.prefTheme === "light"
                ? "Clair"
                : "Système"}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default UserAccountDetails;
