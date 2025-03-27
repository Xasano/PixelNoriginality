import React, { useState, useEffect } from "react";
import { NavLink } from "react-router";

interface Pixel {
    x: number;
    y: number;
    color: string;
    placedBy: string;
    placedAt: string;
}

interface Author {
    _id: string;
    name: string;
}

interface PixelBoardProps {
    _id: string;
    title: string;
    status: "draft" | "active" | "completed";
    creationDate: string;
    endDate: string;
    width: number;
    height: number;
    author: Author;
    allowOverwriting: boolean;
    participationDelay: number;
    pixels: Pixel[];
    contributions: number;
}

interface PixelBoardPreviewProps {
    board: PixelBoardProps;
    showDetails?: boolean;
    className?: string;
}

const PixelBoardPreview: React.FC<PixelBoardPreviewProps> = ({board, showDetails = false, className = ""}) => {
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState("");

    // Calcul du temps restant et du pourcentage de complétion
    useEffect(() => {
        // Calcul du pourcentage de complétion
        const totalPossiblePixels = board.width * board.height;
        const percentage = (board.pixels.length / totalPossiblePixels) * 100;
        setCompletionPercentage(Math.min(percentage, 100));

        // Calcul du temps restant
        updateTimeRemaining();

        // Mise à jour du temps restant toutes les minutes
        const intervalId = setInterval(updateTimeRemaining, 60000);

        return () => clearInterval(intervalId);
    }, [board]);

    // Met à jour l'affichage du temps restant
    const updateTimeRemaining = () => {
        const now = new Date();
        const endDate = new Date(board.endDate);
        const timeRemainingMs = endDate.getTime() - now.getTime();

        if (timeRemainingMs <= 0) {
            setTimeRemaining("Terminé");
            return;
        }

        const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            setTimeRemaining(`${days}j ${hours}h`);
        } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
            setTimeRemaining(`${minutes}m`);
        }
    };

    // Détermine la couleur du badge de statut
    const getStatusBadgeColor = () => {
        switch(board.status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    // Formate la date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className={`bg-white dark:bg-gray-800 border border-transparent dark:border-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
            {/* Entête avec titre et statut - seulement visible en mode détaillé */}
            {showDetails && (
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg truncate">{board.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
                        {board.status === 'active' ? 'En cours' :
                            board.status === 'completed' ? 'Terminé' : 'Brouillon'}
                    </div>
                </div>
            )}

            {/* Prévisualisation grille */}
            <div
                className={`relative w-full ${showDetails ? 'h-60' : 'h-40'} bg-gray-100 dark:bg-gray-900 overflow-hidden`}
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(229, 231, 235, 0.5) 1px, transparent 1px), 
                          linear-gradient(to bottom, rgba(229, 231, 235, 0.5) 1px, transparent 1px)`,
                    backgroundSize: `${100/board.width}% ${100/board.height}%`
                }}
            >
                {/* Badge de temps restant */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 z-10">
                    {timeRemaining}
                </div>

                {/* Badge de complétion - visible seulement en mode détaillé */}
                {showDetails && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 z-10">
                        {completionPercentage.toFixed(1)}% complet
                    </div>
                )}

                {/* Rendu des pixels */}
                {board.pixels && board.pixels.length > 0 && (
                    <div className="absolute inset-0">
                        {board.pixels.map((pixel, index) => (
                            <div
                                key={`${pixel.x}-${pixel.y}-${index}`}
                                style={{
                                    position: 'absolute',
                                    top: `${(pixel.y / board.height) * 100}%`,
                                    left: `${(pixel.x / board.width) * 100}%`,
                                    width: `${100 / board.width}%`,
                                    height: `${100 / board.height}%`,
                                    backgroundColor: pixel.color,
                                }}
                                title={showDetails ? `Placé par: un utilisateur` : ''}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Informations de base */}
            <div className="p-4">
                {!showDetails && (
                    <h3 className="font-bold text-lg mb-2 truncate dark:text-white">{board.title}</h3>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div className="flex justify-between">
                        <p>Dimensions:</p>
                        <p className="font-medium">{board.width}×{board.height}</p>
                    </div>

                    <div className="flex justify-between">
                        <p>Créé le:</p>
                        <p className="font-medium">{formatDate(board.creationDate)}</p>
                    </div>

                    <div className="flex justify-between">
                        <p>Par:</p>
                        <p className="font-medium">{board.author.name}</p>
                    </div>

                    <div className="flex justify-between">
                        <p>Contributions:</p>
                        <p className="font-medium">{board.contributions}</p>
                    </div>

                    {/* Informations supplémentaires en mode détaillé */}
                    {showDetails && (
                        <>
                            <div className="flex justify-between">
                                <p>Date de fin:</p>
                                <p className="font-medium">{formatDate(board.endDate)}</p>
                            </div>

                            <div className="flex justify-between">
                                <p>Pixels placés:</p>
                                <p className="font-medium">{board.pixels.length} / {board.width * board.height}</p>
                            </div>

                            <div className="flex justify-between">
                                <p>Délai entre pixels:</p>
                                <p className="font-medium">{board.participationDelay}s</p>
                            </div>

                            <div className="flex justify-between">
                                <p>Superposition:</p>
                                <p className="font-medium">{board.allowOverwriting ? 'Autorisée' : 'Non autorisée'}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Barre de progression - visible seulement en mode détaillé */}
            {showDetails && (
                <div className="px-4 pb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Bouton d'action en mode détaillé */}
            {showDetails && (
                <div className="px-4 pb-4">
                    <NavLink to={`/pixel-boards/${board._id}`}>
                        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                            {board.status === 'active' ? 'Participer' : 'Voir en détail'}
                        </button>
                    </NavLink>
                </div>
            )}
        </div>
    );
};

// Version avec lien de navigation pour la liste
export const PixelBoardPreviewLink: React.FC<PixelBoardPreviewProps> = (props) => {
    return (
        <NavLink to={`/pixel-boards/${props.board._id}`} className="block">
            <PixelBoardPreview {...props} />
        </NavLink>
    );
};

export default PixelBoardPreview;