import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    sub?: string;
    unique_name?: string;
    role?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            decodeAndSetUser(token);
        }
    }, []);

    const decodeAndSetUser = (token: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(token);

            const role =
                decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                decoded.role ||
                "User";

            setUser({
                id: decoded.sub ? parseInt(decoded.sub) : 0,
                username: decoded.unique_name ?? "User",
                role: role,
                token: token
            });

            localStorage.setItem('token', token);
        } catch {
            logout();
        }
    };

    const login = (token: string) => {
        decodeAndSetUser(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const isAdmin = user?.role === 'Admin';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
