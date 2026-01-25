import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MMKV } from 'react-native-mmkv';
import { User } from '@/services/api/types';
import AuthService from '@/services/api/AuthService';
import ApiClient from '@/services/api/ApiClient';

export const storage = new MMKV();

interface AuthContextType {
    isAuthenticated: boolean;
    isHydrated: boolean;
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Rehydrate state on mount
        const storedUser = storage.getString('user.session');
        const storedToken = storage.getString('auth.token');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserState(parsedUser);
                setTokenState(storedToken);
                // Inject token into ApiClient for subsequent requests
                ApiClient.setToken(storedToken);
            } catch (e) {
                console.error('Failed to parse user session', e);
            }
        }
        setIsHydrated(true);
    }, []);

    const auth = useMemo(
        () => ({
            isAuthenticated: !!user,
            isHydrated,
            user,
            token,
            setAuth: (newUser: User, newToken: string) => {
                storage.set('user.session', JSON.stringify(newUser));
                storage.set('auth.token', newToken);
                ApiClient.setToken(newToken);
                setUserState(newUser);
                setTokenState(newToken);
            },
            logout: async () => {
                await AuthService.logout();
                storage.delete('user.session');
                storage.delete('auth.token');
                ApiClient.setToken(null);
                setUserState(null);
                setTokenState(null);
            },
        }),
        [user, token, isHydrated]
    );

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
