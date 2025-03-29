import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import PixelBoardPreview from "./PixelBoardPreview";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import "@/index.css";
import { IPixelBoard } from "@/interfaces/PixelBoard";

const FinishedPixelBoards3DCarousel = () => {
  const [pixelBoards, setPixelBoards] = useState<IPixelBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchCompletedPixelBoards();
  }, []);

  const fetchCompletedPixelBoards = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:8000/api/pixel-boards",
        {
          params: {
            status: "completed",
            limit: 10,
            sortBy: "endDate",
            sortOrder: "desc",
          },
          withCredentials: true,
        },
      );

      const now = new Date();
      const completedBoards = response.data.data.filter(
        (board: IPixelBoard) => {
          return (
            board.status === "completed" ||
            (board.status === "active" && new Date(board.endDate) <= now)
          );
        },
      );

      setPixelBoards(completedBoards);
      setError(null);

      if (
        completedBoards.length > 0 &&
        currentIndex >= completedBoards.length
      ) {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des PixelBoards:", err);
      setError("Impossible de charger les PixelBoards terminés");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (pixelBoards.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === pixelBoards.length - 1 ? 0 : prevIndex + 1,
      );
    }
  };

  const prevSlide = () => {
    if (pixelBoards.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? pixelBoards.length - 1 : prevIndex - 1,
      );
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Détermine les indices pour les slides visibles
  const getVisibleSlides = () => {
    if (pixelBoards.length <= 1) return [{ index: 0, position: "center" }];

    const totalSlides = pixelBoards.length;
    const result = [];

    // Slide central (actif)
    result.push({ index: currentIndex, position: "center" });

    // Slide à gauche du slide actif
    const leftIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
    result.push({ index: leftIndex, position: "left" });

    // Slide à droite du slide actif
    const rightIndex = currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
    result.push({ index: rightIndex, position: "right" });

    return result;
  };

  const visibleSlides = getVisibleSlides();

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-2xl mb-4 text-gray-800 dark:text-white">
            PixelBoards terminés
          </h2>
          <div className="w-24 h-1 bg-purple-500 rounded-full mt-2"></div>
        </div>

        {pixelBoards.length > 0 && !loading && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-sm font-medium">
            {pixelBoards.length} PixelBoard{pixelBoards.length > 1 ? "s" : ""}{" "}
            terminé{pixelBoards.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-1">Veuillez réessayer plus tard.</p>
        </div>
      )}

      {pixelBoards.length === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              ></path>
            </svg>
            <p className="text-gray-700 mb-2 font-medium">
              Aucun PixelBoard terminé
            </p>
            <p className="text-sm text-gray-500">
              Participez à des PixelBoards actifs pour les voir ici une fois
              terminés
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Boutons de navigation */}
          {pixelBoards.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none border border-gray-200 dark:border-black"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 focus:outline-none border border-gray-200"
                aria-label="Suivant"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Carousel 3D amélioré */}
          <div className="carousel-container overflow-hidden relative h-[450px] py-8 mx-auto">
            <div className="carousel-3d-container relative w-full h-full">
              {pixelBoards.length > 0 &&
                visibleSlides.map(({ index, position }) => {
                  const board = pixelBoards[index];
                  if (!board) return null;

                  let positionClass = "";
                  let zIndex = 0;

                  switch (position) {
                    case "center":
                      positionClass = "card-center";
                      zIndex = 30;
                      break;
                    case "left":
                      positionClass = "card-left";
                      zIndex = 20;
                      break;
                    case "right":
                      positionClass = "card-right";
                      zIndex = 20;
                      break;
                    default:
                      break;
                  }

                  return (
                    <div
                      key={`${board._id}-${index}`}
                      className={`carousel-card absolute ${positionClass}`}
                      style={{ zIndex }}
                      onClick={() => {
                        if (position !== "center") {
                          goToSlide(index);
                        }
                      }}
                    >
                      <div className="card-content shadow-lg rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        <PixelBoardPreview board={board} className="h-full" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Indicateurs de position */}
          {pixelBoards.length > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {pixelBoards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-purple-500 w-8"
                      : "bg-gray-300 w-2.5"
                  }`}
                  aria-label={`Aller au PixelBoard ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm mt-4">
            Chargement des PixelBoards terminés...
          </p>
        </div>
      )}

      {/* Lien pour voir les PixelBoards terminés */}
      {pixelBoards.length > 0 && (
        <div className="mt-8 text-center">
          <NavLink
            to="/pixel-boards/completed"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <span>Voir tous les PixelBoards terminés</span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default FinishedPixelBoards3DCarousel;
