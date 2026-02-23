import { createContext, useContext, useState,  useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types'; // FIXED: Added 'type'
import { jwtDecode } from 'jwt-decode';

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
        if (token) decodeAndSetUser(token);
    }, []);

    const decodeAndSetUser = (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || "User";
            setUser({
                id: parseInt(decoded.sub || "0"),
                username: decoded.unique_name || decoded.sub || "User",
                role: role,
                token
            });
            localStorage.setItem('token', token);
        } catch (e) {
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

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'Admin' }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};