import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { FaEdit, FaTrash, FaTimes, FaSort, FaSortUp, FaSortDown, FaTable, FaThLarge } from "react-icons/fa";
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
    pixels: Pixel[];
    participantCount?: number; // Pour compter les participants uniques
}

interface FilterState {
    status: string;
    title: string;
    startDate: string;
    endDate: string;
    minParticipants: string;
    maxParticipants: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
}

interface PixelBoardListProps {
    showOnlyActive?: boolean;  // Pour filtrer uniquement les actifs
    hideAdminFeatures?: boolean; // Pour masquer les fonctions d'admin
}

// Modal de confirmation pour la suppression
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

// Composant de prévisualisation
const PixelBoardPreview: React.FC<{ board: PixelBoard }> = ({ board }) => {
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

const PixelBoardList: React.FC<PixelBoardListProps> = ({
                                                           showOnlyActive = false,
                                                           hideAdminFeatures = false
                                                       }) => {
    const navigate = useNavigate();
    const [pixelBoards, setPixelBoards] = useState<PixelBoard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pixelBoardToDelete, setPixelBoardToDelete] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [filters, setFilters] = useState<FilterState>({
        status: "",
        title: "",
        startDate: "",
        endDate: "",
        minParticipants: "",
        maxParticipants: "",
        sortBy: "creationDate",
        sortOrder: "desc",
        page: 1,
        limit: 10
    });
    const [totalPages, setTotalPages] = useState(1);

    // Vérifie si l'utilisateur est admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });
                const isUserAdmin = response.data.role === "admin";
                setIsAdmin(isUserAdmin);

                // Si l'utilisateur est admin, afficher la vue tableau par défaut (sauf si on est en mode showOnlyActive)
                if (isUserAdmin && !showOnlyActive) {
                    setViewMode('table');
                }
            } catch (err) {
                console.error("Erreur de vérification du statut admin:", err);
            }
        };

        checkAdminStatus();
    }, [showOnlyActive]);

    // Charger les PixelBoards avec leur nombre de participants
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

                // Si on doit afficher uniquement les actifs, on force le filtre
                if (showOnlyActive) {
                    queryParams.set("status", "active");
                } else if (filters.status) {
                    queryParams.append("status", filters.status);
                }

                const response = await axios.get(`${API_BASE_URL}/pixel-boards?${queryParams.toString()}`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json' }
                });

                // Récupérer les détails et statistiques pour chaque PixelBoard
                let boardsWithDetails = await Promise.all(
                    (response.data.data || []).map(async (board: PixelBoard) => {
                        try {
                            // Récupérer les détails complets
                            const boardResponse = await axios.get(`${API_BASE_URL}/pixel-boards/${board._id}`, {
                                withCredentials: true,
                                headers: { 'Accept': 'application/json' }
                            });

                            // Récupérer les statistiques pour obtenir le nombre de participants
                            const statsResponse = await axios.get(`${API_BASE_URL}/pixel-boards/${board._id}/stats`, {
                                withCredentials: true,
                                headers: { 'Accept': 'application/json' }
                            });

                            return {
                                ...boardResponse.data,
                                participantCount: statsResponse.data.contributorCount || 0
                            };
                        } catch (err) {
                            console.error(`Erreur lors de la récupération des détails pour ${board._id}:`, err);
                            return { ...board, pixels: [], participantCount: 0 };
                        }
                    })
                );

                // Si on montre uniquement les actifs, filtrer ceux dont la date de fin est passée
                if (showOnlyActive) {
                    const now = new Date();
                    boardsWithDetails = boardsWithDetails.filter(board =>
                        board.status === 'active' && new Date(board.endDate) > now
                    );
                }

                // Filtrage côté client
                let filteredBoards = boardsWithDetails;
                // Filtre par titre
                if (filters.title) {
                    const searchTerm = filters.title.toLowerCase();
                    filteredBoards = filteredBoards.filter(board =>
                        board.title.toLowerCase().includes(searchTerm)
                    );
                }
                // Filtre par date de début
                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    filteredBoards = filteredBoards.filter(board =>
                        new Date(board.creationDate) >= startDate
                    );
                }
                // Filtre par date de fin
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    filteredBoards = filteredBoards.filter(board =>
                        new Date(board.creationDate) <= endDate
                    );
                }
                // Filtre par nombre minimum de participants
                if (filters.minParticipants) {
                    const min = parseInt(filters.minParticipants);
                    if (!isNaN(min)) {
                        filteredBoards = filteredBoards.filter(board =>
                            (board.participantCount || 0) >= min
                        );
                    }
                }
                // Filtre par nombre maximum de participants
                if (filters.maxParticipants) {
                    const max = parseInt(filters.maxParticipants);
                    if (!isNaN(max)) {
                        filteredBoards = filteredBoards.filter(board =>
                            (board.participantCount || 0) <= max
                        );
                    }
                }

                setPixelBoards(filteredBoards);
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
    }, [filters, showOnlyActive]);

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

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const handleSort = (field: string) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
            page: 1
        }));
    };

    const getSortIcon = (field: string) => {
        if (filters.sortBy !== field) {
            return <FaSort className="inline ml-1" />;
        }
        return filters.sortOrder === "asc" ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
    };

    const resetFilters = () => {
        setFilters({
            status: showOnlyActive ? "active" : "",
            title: "",
            startDate: "",
            endDate: "",
            minParticipants: "",
            maxParticipants: "",
            sortBy: "creationDate",
            sortOrder: "desc",
            page: 1,
            limit: 10
        });
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">En cours</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Terminé</span>;
            default:
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Brouillon</span>;
        }
    };

    return (
        <>
            <GridBGComponent>
                <div className="container mx-auto py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold dark:text-white">
                                {showOnlyActive ? "PixelBoards en cours" : "PixelBoards"}
                            </h1>
                            <div className="flex space-x-4">
                                {isAdmin && !hideAdminFeatures && (
                                    <>
                                        <div className="flex space-x-2 mr-4">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                                title="Vue grille"
                                            >
                                                <FaThLarge />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('table')}
                                                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                                title="Vue tableau"
                                            >
                                                <FaTable />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => navigate("/pixel-boards/create")}
                                            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                                        >
                                            Créer un PixelBoard
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
                                {error}
                            </div>
                        )}

                        {/* Filtres - toujours visibles, même pour les utilisateurs standard */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium dark:text-white">Filtres</h2>
                                <button
                                    onClick={resetFilters}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 text-sm"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {/* Filtre par statut - caché si showOnlyActive est true */}
                                {!showOnlyActive && (
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">Tous</option>
                                            <option value="draft">Brouillon</option>
                                            <option value="active">En cours</option>
                                            <option value="completed">Terminé</option>
                                        </select>
                                    </div>
                                )}

                                {/* Filtre par titre */}
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Titre
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={filters.title}
                                        onChange={handleFilterChange}
                                        placeholder="Rechercher..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Filtre par date de début */}
                                <div>
                                    <label
                                        htmlFor="startDate"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Date début
                                    </label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Filtre par date de fin */}
                                <div>
                                    <label
                                        htmlFor="endDate"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Date fin
                                    </label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Filtres par nombre de participants */}
                                <div>
                                    <label
                                        htmlFor="minParticipants"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Participants
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            id="minParticipants"
                                            name="minParticipants"
                                            value={filters.minParticipants}
                                            onChange={handleFilterChange}
                                            placeholder="Min"
                                            min="0"
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <input
                                            type="number"
                                            id="maxParticipants"
                                            name="maxParticipants"
                                            value={filters.maxParticipants}
                                            onChange={handleFilterChange}
                                            placeholder="Max"
                                            min="0"
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : pixelBoards.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-8 text-center">
                                <div className="flex flex-col items-center">
                                    <svg
                                        className="w-16 h-16 text-gray-400 mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                                    </svg>
                                    <p className="text-gray-700 mb-2 font-medium dark:text-gray-300">
                                        {showOnlyActive ? "Aucun PixelBoard actif" : "Aucun PixelBoard trouvé"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {showOnlyActive ? "Revenez plus tard ou créez votre propre PixelBoard" : "Essayez de modifier vos filtres"}
                                    </p>
                                </div>
                            </div>
                        ) : viewMode === 'grid' || showOnlyActive ? (
                            // Vue Grille (toujours utilisée si showOnlyActive est true)
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pixelBoards.map((board) => (
                                    <div
                                        key={board._id}
                                        className="relative bg-white dark:bg-gray-800 border border-transparent dark:border-black rounded-md shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                                    >
                                        {isAdmin && !hideAdminFeatures && (
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
                                            <PixelBoardPreview board={board} />

                                            <div className="p-4">
                                                <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white truncate">
                                                    {board.title}
                                                </h2>
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
                                                        <p className="font-medium">{board.author?.name || "Inconnu"}</p>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <p>Participants:</p>
                                                        <p className="font-medium">{board.participantCount || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </NavLink>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Vue Tableau pour l'admin
                            <div className="overflow-x-auto">
                                <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("_id")}
                                        >
                                            ID {getSortIcon("_id")}
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("title")}
                                        >
                                            Titre {getSortIcon("title")}
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("status")}
                                        >
                                            Statut {getSortIcon("status")}
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("creationDate")}
                                        >
                                            Création {getSortIcon("creationDate")}
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("endDate")}
                                        >
                                            Fin {getSortIcon("endDate")}
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            Auteur
                                        </th>
                                        <th
                                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("participantCount")}
                                        >
                                            Participants {getSortIcon("participantCount")}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {pixelBoards.map((board) => (
                                        <tr
                                            key={board._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            onClick={() => navigate(`/pixel-boards/${board._id}`)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {board._id.substring(0, 6)}...
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {board.title}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getStatusBadge(board.status)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(board.creationDate)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(board.endDate)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {board.author?.name || "Inconnu"}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                                {board.participantCount || 0}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/pixel-boards/edit/${board._id}`);
                                                        }}
                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        title="Modifier"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(board._id);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Supprimer"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(filters.page - 1)}
                                        disabled={filters.page === 1}
                                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 dark:text-white"
                                    >
                                        Précédent
                                    </button>
                                    <span className="px-3 py-1 bg-blue-500 text-white rounded-md">
                                       {filters.page} / {totalPages}
                                   </span>
                                    <button
                                        onClick={() => handlePageChange(filters.page + 1)}
                                        disabled={filters.page === totalPages}
                                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 dark:text-white"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GridBGComponent>

            {/* Modal de suppression seulement pour les admins si nécessaire */}
            {isAdmin && !hideAdminFeatures && (
                <ConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDeletePixelBoard}
                    title={
                        pixelBoards.find(b => b._id === pixelBoardToDelete)?.title || ''
                    }
                />
            )}
        </>
    );
};

export default PixelBoardList;
