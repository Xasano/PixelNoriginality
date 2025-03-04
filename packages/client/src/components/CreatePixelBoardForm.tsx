import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface CreatePixelBoardFormProps {
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

const CreatePixelBoardForm: React.FC<CreatePixelBoardFormProps> = ({
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default values
  const [formData, setFormData] = useState<PixelBoardFormData>({
    title: "",
    status: "draft",
    endDate: "",
    width: 100,
    height: 100,
    allowOverwriting: false,
    participationDelay: 60, // Default 60 seconds
  });

  // Set minimum end date as tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minEndDate = tomorrow.toISOString().split("T")[0];

  // Si la date de fin n'est pas définie, définir la date par défaut à 7 jours
  useEffect(() => {
    if (!formData.endDate) {
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 7);
      setFormData((prev) => ({
        ...prev,
        endDate: defaultEndDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.endDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle different input types
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
      // Convert numeric fields to numbers
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form fields
      if (!formData.title.trim()) {
        throw new Error("Le titre est requis");
      }

      if (!formData.endDate) {
        throw new Error("La date de fin est requise");
      }

      // Current date for validation
      const currentDate = new Date();
      const endDate = new Date(formData.endDate);

      if (endDate <= currentDate) {
        throw new Error("La date de fin doit être dans le futur");
      }

      if (formData.width < 100 || formData.width > 1000) {
        throw new Error("La largeur doit être entre 100 et 1000 pixels");
      }

      if (formData.height < 100 || formData.height > 1000) {
        throw new Error("La hauteur doit être entre 100 et 1000 pixels");
      }

      if (formData.participationDelay < 10) {
        throw new Error(
          "Le délai minimum entre participations est de 10 secondes"
        );
      }

      // Submit the form data to parent component handler
      await onSubmit(formData);

      // Redirect to board
      navigate("/pixel-boards");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la création du PixelBoard");
      }
    } finally {
      setLoading(false);
    }
  };

  // Génère une prévisualisation de la grille pour les dimensions sélectionnées
  const renderGridPreview = () => {
    // Taille fixe pour le conteneur de prévisualisation
    const previewContainerWidth = 300;
    const previewContainerHeight = 200;

    // Calculer le ratio width/height du board
    const boardRatio = formData.width / formData.height;

    // Déterminer les dimensions de la prévisualisation en conservant le ratio
    let previewWidth, previewHeight;

    if (boardRatio > previewContainerWidth / previewContainerHeight) {
      // Si le board est plus large que haut par rapport au conteneur
      previewWidth = previewContainerWidth;
      previewHeight = previewWidth / boardRatio;
    } else {
      // Si le board est plus haut que large par rapport au conteneur
      previewHeight = previewContainerHeight;
      previewWidth = previewHeight * boardRatio;
    }

    return (
      <div className="my-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prévisualisation du ratio ({formData.width}x{formData.height})
        </h3>
        <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <div
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
            }}
          >
            {/* Optionnel: ajouter une grille stylisée pour représenter les pixels */}
            <div
              className="w-full h-full bg-repeat"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(128,128,128,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.1) 1px, transparent 1px)",
                backgroundSize: `${Math.max(previewWidth / 20, 5)}px ${Math.max(
                  previewHeight / 20,
                  5
                )}px`,
              }}
            ></div>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Cette prévisualisation montre uniquement les proportions, pas la
          taille réelle.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Créer un PixelBoard
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
            <option value="active">En cours de création</option>
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Un brouillon ne sera pas visible par les autres utilisateurs jusqu'à
            ce que vous l'activiez
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
            min={minEndDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Le PixelBoard sera automatiquement fermé à cette date
          </p>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="width"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Largeur (pixels) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id="width-range"
                name="width"
                value={formData.width}
                onChange={handleChange}
                min="100"
                max="1000"
                className="w-full mr-2"
              />
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                min="100"
                max="1000"
                className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="height"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Hauteur (pixels) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id="height-range"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="100"
                max="1000"
                className="w-full mr-2"
              />
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="100"
                max="1000"
                className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Prévisualisation de la grille */}
        {renderGridPreview()}

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

        {/* Résumé des informations */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Résumé des informations
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              Date de création:{" "}
              <span className="font-medium">Automatique (date actuelle)</span>
            </li>
            <li>
              Auteur: <span className="font-medium">Vous</span>
            </li>
            <li>
              Statut initial:{" "}
              <span className="font-medium">
                {formData.status === "draft"
                  ? "Brouillon"
                  : "En cours de création"}
              </span>
            </li>
            <li>
              Taille totale:{" "}
              <span className="font-medium">
                {formData.width}×{formData.height} ={" "}
                {formData.width * formData.height} pixels
              </span>
            </li>
          </ul>
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
            {loading ? "Création en cours..." : "Créer le PixelBoard"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePixelBoardForm;
