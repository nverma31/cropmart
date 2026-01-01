import { AuthResponse, User } from './types';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
    private currentUser: User | null = null;

    async sendOtp(phone: string): Promise<boolean> {
        await delay(1000);
        // In a real app, this would call the backend to send SMS
        console.log(`[MockAuth] OTP sent to ${phone}`);
        return true;
    }

    async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
        await delay(1500);

        // Mock validation
        if (otp !== '1234') {
            throw new Error('Invalid OTP. Please enter 1234.');
        }

        // Mock User Generation based on Phone Number for testing
        // Ends with 2222 -> Intermediary
        // Ends with 1111 -> Farmer
        // Others -> New User

        if (phone.endsWith('1111') || phone.endsWith('2222')) {
            const isIntermediary = phone.endsWith('2222');
            const user: User = {
                id: isIntermediary ? 'int_001' : 'farm_001',
                name: isIntermediary ? 'Rajesh Kumar (Intermediary)' : 'Suresh Kisan',
                phone,
                role: isIntermediary ? 'INTERMEDIARY' : 'FARMER',
                farmLocation: isIntermediary ? undefined : 'Punjab, District Ludhiana',
                farmSize: isIntermediary ? undefined : '15 Acres',
            };

            this.currentUser = user;

            return {
                user,
                token: 'mock-jwt-token-' + Date.now(),
                isNewUser: false,
            };
        } else {
            return {
                isNewUser: true,
            };
        }
    }

    async register(userData: Omit<User, 'id'>): Promise<AuthResponse> {
        await delay(1500);

        const newUser: User = {
            ...userData,
            id: `user_${Date.now()}`,
        };

        this.currentUser = newUser;
        return {
            user: newUser,
            token: 'mock-jwt-token-' + Date.now(),
            isNewUser: false,
        };
    }
    async logout(): Promise<void> {
        await delay(500);
        this.currentUser = null;
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }
}

export default new AuthService();
