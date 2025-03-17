import React, { useState, useEffect } from "react";
import axios from "axios";

interface UserActionButtonsProps {
  handleNavigateToHome: () => void;
  currentUser?: {
    _id: string
    name: string;
    email: string;
    prefTheme?: string;
    avatar?: string;
  };
}

const UserActionButtons: React.FC<UserActionButtonsProps> = ({
  handleNavigateToHome,
  currentUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id: currentUser?._id || "",
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    prefTheme: currentUser?.prefTheme || "light",
    avatar: currentUser?.avatar || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        id: currentUser._id || "",
        name: currentUser.name || "",
        email: currentUser.email || "",
        prefTheme: currentUser.prefTheme || "light",
        avatar: currentUser.avatar || "",
      });
    }
  }, [currentUser]);

  const openModal = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!/\S+@\S+\.\S+/.test(formData.email) && formData.email === undefined) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Envoi des données avec Axios
      const response = await axios.put(`http://localhost:8000/api/user/${formData.id}`, {
        name: formData.name,
        email: formData.email,
        prefTheme: formData.prefTheme,
        avatar: formData.avatar
      });
      
      console.log("Réponse du serveur:", response.data);
      closeModal();
      
      // Rechargement de la page pour afficher les modifications
      window.location.reload();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError("Une erreur s'est produite lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            onClick={openModal}
          >
            Modifier mon profil
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md transition-colors duration-200"
            onClick={handleNavigateToHome}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>

      {/* Modal/Popup pour modifier le profil */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 dark:bg-gray-700/80 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-500 dark:bg-gray-600 p-4">
              <h2 className="text-white text-xl font-bold">Modifier mon profil</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

                <div className="mb-4">
                <label 
                  htmlFor="avatar" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Avatar
                </label>
                {formData.avatar && (
                  <div className="mb-2 flex justify-center">
                  <img 
                    src={formData.avatar} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                  </div>
                )}
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                    setFormData((prev) => ({
                      ...prev,
                      avatar: reader.result as string,
                    }));
                    };
                    reader.readAsDataURL(file);
                  }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="prefTheme" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Thème préféré
                </label>
                <select
                  id="prefTheme"
                  name="prefTheme"
                  value={formData.prefTheme}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="">Système</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserActionButtons;