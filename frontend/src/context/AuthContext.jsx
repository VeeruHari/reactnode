import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function checkSession() {
        try {
            
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/check-session`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            const data = await response.json();

            setIsAuthenticated(true);
            setUser(data.user);
        } catch {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                {
                    email,
                    password,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            setIsAuthenticated(true);
            setUser(data.user);

            return {
                success: true,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Unable to connect to server.",
            };
        }
    }

    async function logout() {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/logout`,
                {},
                {
                    withCredentials: true,
                }
            );

            setIsAuthenticated(false);
            setUser(null);

            return response.data;

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                checkSession,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}