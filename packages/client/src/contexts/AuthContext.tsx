import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import AuthService from '../helpers/auth';
import { User } from '../model/User';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    // Vérifier l'authentification au chargement
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true);
                const currentUser = await AuthService.getCurrentUser();

                if (currentUser) {
                    setUser(currentUser);
                    setIsLoggedIn(true);
                    setIsAdmin(currentUser.role === 'admin');
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'authentification:', error);
                setUser(null);
                setIsLoggedIn(false);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Fonction de connexion
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userData = await AuthService.login(email, password);
            setUser(userData);
            setIsLoggedIn(true);
            setIsAdmin(userData.role === 'admin');
            localStorage.setItem('isLoggedIn', 'true');
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction d'inscription
    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await AuthService.register(name, email, password);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction de déconnexion
    const logout = async () => {
        setIsLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
            localStorage.removeItem('isLoggedIn');
            // Après déconnexion, rediriger vers la page d'accueil
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isLoading,
        isLoggedIn,
        isAdmin,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};