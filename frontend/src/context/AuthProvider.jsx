import {
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import axios from "axios";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/auth/check-session`,
                {
                    withCredentials: true,
                }
            );

            if (data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.log(error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (email, password) => {
        const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/login`,
            { email, password },
            {
                withCredentials: true,
            }
        );

        setUser(data.user);

        return data;
    };

    const logout = async () => {
        await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/logout`,
            {},
            {
                withCredentials: true,
            }
        );

        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            checkSession,
        }),
        [user, loading, checkSession]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}