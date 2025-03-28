import React from "react";
import { User } from "../../interfaces/User";

interface UserProfileHeaderProps {
  currentUser: User;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  currentUser,
}) => {
  return (
    <div className="p-8 bg-blue-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="mb-6 md:mb-0 md:mr-8 flex justify-center">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={`Avatar de ${currentUser.name}`}
              className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-md"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-gray-300 dark:bg-gray-500 flex items-center justify-center border-4 border-white dark:border-gray-600 shadow-md">
              <span className="text-3xl font-bold text-gray-600 dark:text-gray-200">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentUser.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {currentUser.email}
          </p>
          <div className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            {currentUser.role.charAt(0).toUpperCase() +
              currentUser.role.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
