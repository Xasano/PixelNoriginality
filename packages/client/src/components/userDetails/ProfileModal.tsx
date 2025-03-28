import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingButton from "./LoadingButton";
import { ModalProps } from "@interfaces/ModalProps";

interface ProfileFormData {
  id: string;
  name: string;
  email: string;
  prefTheme: string;
  avatar: string;
}

const ProfileModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de base
    if (!/\S+@\S+\.\S+/.test(formData.email) && formData.email !== undefined) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Envoi des données avec Axios
      const response = await axios.put(
        `http://localhost:8000/api/user/${formData.id}`,
        {
          name: formData.name,
          email: formData.email,
          prefTheme: formData.prefTheme,
          avatar: formData.avatar,
        },
      );

      console.log("Réponse du serveur:", response.data);
      onClose();

      // Rechargement de la page pour afficher les modifications
      window.location.reload();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError("Une erreur s'est produite lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-gray-700/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-200 dark:bg-gray-600 p-4">
          <h2 className="text-black dark:text-white text-xl font-bold">
            Modifier mon profil
          </h2>
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
            <LoadingButton
              type="button"
              text="Annuler"
              loadingText="Annuler"
              isLoading={false}
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            />
            <LoadingButton
              type="submit"
              text="Enregistrer"
              loadingText="En cours..."
              isLoading={isSubmitting}
              variant="primary"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
