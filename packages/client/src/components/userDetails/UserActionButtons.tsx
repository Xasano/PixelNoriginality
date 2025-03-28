// src/components/user/UserActionButtons.tsx
import { User } from "@interfaces/User";
import React, { useState } from "react";
import PasswordModal from "./PasswordModal";
import ProfileModal from "./ProfileModal";

interface UserActionButtonsProps {
  handleNavigateToHome: () => void;
  currentUser?: User;
}

const UserActionButtons: React.FC<UserActionButtonsProps> = ({
  handleNavigateToHome,
  currentUser,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState<boolean>(false);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  return (
    <>
      <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              onClick={openProfileModal}
            >
              Modifier mon profil
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              onClick={openPasswordModal}
            >
              Changer mon mot de passe
            </button>
          </div>
          <button
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md transition-colors duration-200"
            onClick={handleNavigateToHome}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>

      {/* Modal pour modifier le profil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        currentUser={currentUser}
      />

      {/* Modal pour modifier le mot de passe */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        currentUser={currentUser}
      />
    </>
  );
};

export default UserActionButtons;
