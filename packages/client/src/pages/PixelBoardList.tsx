import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import GridBGComponent from "../components/GridBGComponent";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = 'http://localhost:8000/api';

interface Pixel {
    x: number;
    y: number;
    color: string;
    placedBy: string;
    placedAt: string;
}

interface PixelBoard {
    _id: string;
    title: string;
    status: "draft" | "active" | "completed";
    creationDate: string;
    endDate: string;
    width: number;
    height: number;
    author: {
        _id: string;
        name: string;
    };
    allowOverwriting: boolean;
    participationDelay: number;
    pixels: Pixel[]; // Ajout de la liste des pixels
}

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
}> = ({ isOpen, onClose, onConfirm, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FaTimes />
                </button>
                <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
                    Confirmer la suppression
                </h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Êtes-vous sûr de vouloir supprimer le PixelBoard "{title}" ?
                    Cette action est irréversible.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

// Composant pour afficher la prévisualisation du PixelBoard avec ses pixels
const PixelBoardPreview: React.FC<{ board: PixelBoard }> = ({ board }) => {
    // Calculer la taille des cellules en fonction des dimensions du tableau
    const maxPreviewSize = 160; // Hauteur de la prévisualisation (h-40 = 160px)
    const cellSize = Math.min(
        maxPreviewSize / board.width,
        maxPreviewSize / board.height
    );

    return (
        <div
            className="h-40 w-full bg-gray-100 dark:bg-gray-900 relative overflow-hidden"
            style={{
                backgroundImage: `linear-gradient(to right, rgba(229, 231, 235, 0.5) 1px, transparent 1px), 
                                linear-gradient(to bottom, rgba(229, 231, 235, 0.5) 1px, transparent 1px)`,
                backgroundSize: `${100/board.width}% ${100/board.height}%`
            }}
        >
            {/* Affichage du statut */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium z-10
                ${board.status === 'active' ? 'bg-green-100 text-green-800' :
                board.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'}`}
            >
                {board.status === 'active' ? 'En cours' :
                    board.status === 'completed' ? 'Terminé' : 'Brouillon'}
            </div>

            {/* Grille des pixels */}
            <div className="absolute inset-0">
                {/* On n'affiche que si le tableau a des pixels */}
                {board.pixels && board.pixels.length > 0 && (
                    <div className="relative w-full h-full">
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
                                title={`Placé par: ${pixel.placedBy}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PixelBoardList: React.FC = () => {
    const navigate = useNavigate();
    const [pixelBoards, setPixelBoards] = useState<PixelBoard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pixelBoardToDelete, setPixelBoardToDelete] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        status: "",
        sortBy: "creationDate",
        sortOrder: "desc",
        page: 1,
        limit: 10
    });
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });
                setIsAdmin(response.data.role === "admin");
            } catch (err) {
                console.error("Erreur de vérification du statut admin:", err);
            }
        };

        checkAdminStatus();
    }, []);

    useEffect(() => {
        const fetchPixelBoards = async () => {
            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams({
                    page: filters.page.toString(),
                    limit: filters.limit.toString(),
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder
                });

                if (filters.status) {
                    queryParams.append("status", filters.status);
                }

                const response = await axios.get(`${API_BASE_URL}/pixel-boards?${queryParams.toString()}`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });

                // Récupérer les données avec les pixels pour chaque PixelBoard
                const boardsWithPixels = await Promise.all(
                    (response.data.data || []).map(async (board: PixelBoard) => {
                        try {
                            // Récupérer les détails complets de chaque PixelBoard, y compris les pixels
                            const boardResponse = await axios.get(`${API_BASE_URL}/pixel-boards/${board._id}`, {
                                withCredentials: true,
                                headers: { 'Accept': 'application/json' }
                            });
                            return boardResponse.data;
                        } catch (err) {
                            console.error(`Erreur lors de la récupération des détails pour ${board._id}:`, err);
                            // Retourner le board sans pixels si on ne peut pas récupérer les détails
                            return { ...board, pixels: [] };
                        }
                    })
                );

                setPixelBoards(boardsWithPixels);
                setTotalPages(response.data.pagination?.pages || 1);
            } catch (err) {
                console.error("Erreur lors du chargement des PixelBoards:", err);
                setError("Une erreur est survenue lors du chargement des PixelBoards");
                toast.error("Impossible de charger les PixelBoards");
            } finally {
                setLoading(false);
            }
        };

        fetchPixelBoards();
    }, [filters]);

    const handleDeletePixelBoard = async () => {
        if (!pixelBoardToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/pixel-boards/${pixelBoardToDelete}`, {
                withCredentials: true
            });

            setPixelBoards(prev => prev.filter(board => board._id !== pixelBoardToDelete));

            setDeleteModalOpen(false);
            setPixelBoardToDelete(null);

            toast.success('PixelBoard supprimé avec succès');
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            toast.error('Impossible de supprimer le PixelBoard');
        }
    };

    const confirmDelete = (boardId: string) => {
        setPixelBoardToDelete(boardId);
        setDeleteModalOpen(true);
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString();

    const getRemainingTime = (endDate: string) => {
        const end = new Date(endDate).getTime();
        const now = Date.now();
        const diff = end - now;

        if (diff <= 0) return "Terminé";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${days}j ${hours}h`;
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1
        }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <>
            <GridBGComponent>
                <div className="container mx-auto py-16 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold dark:text-white">PixelBoards</h1>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate("/pixel-boards/create")}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                                >
                                    Créer un PixelBoard
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Statut
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Tous</option>
                                    <option value="draft">Brouillon</option>
                                    <option value="active">En cours</option>
                                    <option value="completed">Terminé</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="sortBy"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Trier par
                                </label>
                                <select
                                    id="sortBy"
                                    name="sortBy"
                                    value={filters.sortBy}
                                    onChange={handleFilterChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="creationDate">Date de création</option>
                                    <option value="endDate">Date de fin</option>
                                    <option value="title">Titre</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="sortOrder"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Ordre
                                </label>
                                <select
                                    id="sortOrder"
                                    name="sortOrder"
                                    value={filters.sortOrder}
                                    onChange={handleFilterChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="desc">Décroissant</option>
                                    <option value="asc">Croissant</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : pixelBoards.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-8 text-center">
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Aucun PixelBoard trouvé.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pixelBoards.map((board) => (
                                    <div
                                        key={board._id}
                                        className="relative bg-white dark:bg-gray-800 rounded-md shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                                    >
                                        {isAdmin && (
                                            <div className="absolute top-2 right-2 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/pixel-boards/edit/${board._id}`);
                                                    }}
                                                    className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600"
                                                    title="Modifier le PixelBoard"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        confirmDelete(board._id);
                                                    }}
                                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                    title="Supprimer le PixelBoard"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        <NavLink to={`/pixel-boards/${board._id}`} className="block">
                                            {/* Utiliser le composant PixelBoardPreview pour afficher la prévisualisation avec pixels */}
                                            <PixelBoardPreview board={board} />

                                            <div className="p-4">
                                                <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white truncate">
                                                    {board.title}
                                                </h2>
                                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                    <p>Dimensions: {board.width}×{board.height}</p>
                                                    <p>Créé par: {board.author?.name || "Inconnu"}</p>
                                                    <p>Temps restant: {getRemainingTime(board.endDate)}</p>
                                                    <p>Pixels placés: {board.pixels?.length || 0}</p>
                                                </div>
                                            </div>
                                        </NavLink>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(filters.page - 1)}
                                        disabled={filters.page === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                                    >
                                        Précédent
                                    </button>
                                    <span className="px-3 py-1 bg-blue-500 text-white rounded-md">
                                        {filters.page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(filters.page + 1)}
                                        disabled={filters.page === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GridBGComponent>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeletePixelBoard}
                title={
                    pixelBoards.find(b => b._id === pixelBoardToDelete)?.title || ''
                }
            />
        </>
    );
};

export default PixelBoardList;