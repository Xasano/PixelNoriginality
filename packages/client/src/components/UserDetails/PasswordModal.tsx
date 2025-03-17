import React, { useState, useEffect } from "react";
import axios from "axios";
import { ModalProps, PasswordFormData } from "./types";
import LoadingButton from "./LoadingButton";

const PasswordModal: React.FC<ModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        onClose(); // Fermer la modal principale après succès
      }, 2000); // Affichage pendant 2 secondes
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await axios.put(
        `http://localhost:8000/api/auth/password/${currentUser?._id}`,
        {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setShowSuccessModal(true);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-blue-200 p-4">
            <h2 className="text-black text-xl font-bold">Modifier mon mot de passe</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-10">
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <LoadingButton type="button" text="Annuler" isLoading={false} variant="secondary" onClick={onClose} disabled={isSubmitting} loadingText={""} />
              <LoadingButton type="submit" text="Enregistrer" loadingText="En cours..." isLoading={isSubmitting} variant="primary" disabled={isSubmitting} />
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Modal de Succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center transition transform scale-95 opacity-0 animate-success-modal">
            <h3 className="text-lg font-semibold text-green-600">Succès !</h3>
            <p className="text-gray-700 mt-2">Votre mot de passe a été modifié avec succès 🎉</p>
            <button
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ✅ Animation Tailwind */}
      <style>
        {`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-success-modal {
            animation: fadeInScale 0.3s ease-out forwards;
          }
        `}
      </style>
    </>
  );
};

export default PasswordModal;
