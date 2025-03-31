import { VisitorLimits } from "@/interfaces/VisitorLimits";
import React, { useState, useEffect } from "react";

interface VisitorBannerProps {
  limits: VisitorLimits | null;
  loading: boolean;
}

export const VisitorBanner: React.FC<VisitorBannerProps> = ({
  limits,
  loading,
}) => {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    if (limits && limits.timeUntilNextPixel && limits.timeUntilNextPixel > 0) {
      console.log("LIMITS UPDATED", limits);
      setShowBanner(true);
    }
  }, [limits]);

  // Fonction pour formater le temps en minutes/secondes
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "0s";
    const remaniningHours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    return `${remaniningHours > 0 ? remaniningHours + "h " : ""}${remainingMinutes > 0 ? remainingMinutes + "m " : ""}${remainingSeconds > 0 ? remainingSeconds + "s" : ""}`;
  };

  // Détermine si on a atteint la limite quotidienne
  const hasReachedDailyLimit =
    limits?.pixelsRemaining !== undefined && limits.pixelsRemaining <= 0;
  // Détermine si on est en attente pour placer un nouveau pixel
  const isWaitingForNextPixel =
    limits?.timeUntilNextPixel !== undefined && limits.timeUntilNextPixel > 0;

  // Couleur de la bannière selon l'état
  const getBannerColorClass = () => {
    return "bg-blue-700 dark:bg-blue-800 border-blue-600 dark:border-blue-700";
  };

  // Texte d'état pour le bouton
  const getCompactStatusText = () => {
    if (hasReachedDailyLimit) return "Limite atteinte !";
    if (isWaitingForNextPixel)
      return `Prochain: ${formatTime(limits?.timeUntilNextPixel || 0)}`;
    return `${limits?.pixelsRemaining || 0} pixels restants`;
  };
  return (
    <>
      {/* Bouton flottant pour afficher la bannière */}
      <button
        onClick={() => setShowBanner(!showBanner)}
        className={`fixed z-40 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-t-lg shadow-lg text-white text-sm font-medium flex items-center space-x-1 transition-all duration-200
                    ${getBannerColorClass()}
                    ${showBanner ? "bottom-22" : "bottom-0"}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <span>{loading ? "Chargement..." : getCompactStatusText()}</span>
        <span className="ml-1">{showBanner ? "▼" : "▲"}</span>
      </button>

      {/* Bannière détaillée */}
      {showBanner && limits && (
        <div
          className={`fixed bottom-0 left-0 right-0 p-3 shadow-lg z-30 border-t text-white h-22 rounded-t-lg transition-all duration-200
                    ${getBannerColorClass()}`}
        >
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
              <div className="mb-2 sm:mb-0 flex items-center">
                <span className="font-medium">
                  Mode visiteur - {limits.totalPixelsPlaced} pixels placés
                </span>
                {hasReachedDailyLimit && (
                  <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full animate-pulse">
                    Limite atteinte
                  </span>
                )}
              </div>

              {!hasReachedDailyLimit && (
                <div className="text-sm flex flex-col sm:flex-row sm:items-center">
                  <div className="sm:mr-4">
                    <span className="font-semibold">
                      {limits.pixelsRemaining}
                    </span>{" "}
                    pixels restants aujourd'hui
                  </div>
                  {isWaitingForNextPixel && (
                    <div>
                      Prochain pixel dans{" "}
                      <span className="font-semibold">
                        {formatTime(limits.timeUntilNextPixel)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs">
                <span>Quota: {limits.dailyPixelLimit} pixels/jour • </span>
                <span>Délai: {formatTime(limits.boardDelay)} • </span>
                <span>
                  Réinitialisation dans {formatTime(limits.timeUntilDailyReset)}
                </span>
              </div>
              <a
                href="/register"
                className="px-3 py-1 bg-white text-blue-800 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                S'inscrire pour dessiner sans limites !
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
