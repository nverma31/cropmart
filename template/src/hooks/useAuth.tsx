import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MMKV } from 'react-native-mmkv';
import { User } from '@/services/api/types';
import AuthService from '@/services/api/AuthService';

export const storage = new MMKV();

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);

    useEffect(() => {
        // Rehydrate state on mount
        const storedUser = storage.getString('user.session');
        if (storedUser) {
            try {
                setUserState(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user session', e);
            }
        }
    }, []);

    const auth = useMemo(
        () => ({
            isAuthenticated: !!user,
            user,
            setUser: (newUser: User | null) => {
                if (newUser) {
                    storage.set('user.session', JSON.stringify(newUser));
                } else {
                    storage.delete('user.session');
                }
                setUserState(newUser);
            },
            logout: async () => {
                await AuthService.logout();
                storage.delete('user.session');
                setUserState(null);
            },
        }),
        [user]
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
