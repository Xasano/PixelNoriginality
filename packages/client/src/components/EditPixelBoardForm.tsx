import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

interface EditPixelBoardFormProps {
  onSubmit: (pixelBoardData: PixelBoardFormData) => Promise<void>;
}

export interface PixelBoardFormData {
  title: string;
  status: "draft" | "active" | "completed";
  endDate: string;
  width: number;
  height: number;
  allowOverwriting: boolean;
  participationDelay: number;
}

const EditPixelBoardForm: React.FC<EditPixelBoardFormProps> = ({
  onSubmit,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PixelBoardFormData | null>(null);

  useEffect(() => {
    const fetchPixelBoard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/pixel-boards/${id}`,
          {
            withCredentials: true,
          },
        );
        setFormData(response.data);
      } catch (err) {
        setError("Impossible de charger les données du PixelBoard");
      } finally {
        setLoading(false);
      }
    };

    fetchPixelBoard();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (formData) {
      if (type === "checkbox") {
        const checkboxInput = e.target as HTMLInputElement;
        setFormData({
          ...formData,
          [name]: checkboxInput.checked,
        });
      } else if (
        name === "width" ||
        name === "height" ||
        name === "participationDelay"
      ) {
        setFormData({
          ...formData,
          [name]: parseInt(value, 10),
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      setLoading(true);
      setError(null);
      try {
        await onSubmit(formData);
      } catch (err) {
        setError("Échec de la mise à jour du PixelBoard");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Modifier un PixelBoard
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre */}
        <div>
          <label
            htmlFor="title"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Mon PixelBoard"
            required
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Statut
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="draft">Brouillon</option>
            <option value="active">En cours</option>
            <option value="completed">Terminé</option>
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Modifier le statut peut affecter la visibilité et l'accès au
            PixelBoard
          </p>
        </div>

        {/* Date de fin */}
        <div>
          <label
            htmlFor="endDate"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Date de fin <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Le PixelBoard sera automatiquement fermé à cette date
          </p>
        </div>

        {/* Mode de dessin */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowOverwriting"
            name="allowOverwriting"
            checked={formData.allowOverwriting}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="allowOverwriting"
            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Autoriser le dessin sur des pixels déjà utilisés
          </label>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 pl-6">
          Si activé, les utilisateurs pourront redessiner sur des pixels déjà
          colorés
        </p>

        {/* Délai entre participations */}
        <div>
          <label
            htmlFor="participationDelay"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Délai entre participations (secondes){" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input
              type="range"
              id="participationDelay-range"
              name="participationDelay"
              value={formData.participationDelay}
              onChange={handleChange}
              min="10"
              max="300"
              step="5"
              className="w-full mr-2"
            />
            <input
              type="number"
              id="participationDelay"
              name="participationDelay"
              value={formData.participationDelay}
              onChange={handleChange}
              min="10"
              className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Temps d'attente minimal avant qu'un utilisateur puisse ajouter un
            nouveau pixel
          </p>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800"
          >
            {loading ? "Modification en cours..." : "Modifier le PixelBoard"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPixelBoardForm;
