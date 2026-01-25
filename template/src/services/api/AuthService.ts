/**
 * Authentication Service
 * 
 * MOCK MODE: Uses in-memory data until backend OTP is ready
 * Backend: https://cropmart-backend.onrender.com/v1
 */

import ApiClient from './ApiClient';
import {
    User,
    Farmer,
    Intermediary,
} from './types';

// Mock delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data stores (in-memory until backend ready)
let MOCK_USERS: User[] = [];
let MOCK_FARMERS: Farmer[] = [];
let MOCK_INTERMEDIARIES: Intermediary[] = [];

interface MockVerifyOtpResponse {
    user: User;
    token: string;
    isNewUser: boolean;
}

class AuthService {
    /**
     * MOCK: Request OTP for phone number
     */
    async sendOtp(phone: string): Promise<void> {
        await delay(1000);
        console.log(`[MockAuth] OTP sent to ${phone}. Use '1234' to verify.`);
    }

    /**
     * MOCK: Verify OTP and login/register
     * Returns: { user, token, isNewUser }
     */
    async verifyOtp(phone: string, otp: string): Promise<MockVerifyOtpResponse> {
        await delay(1500);

        if (otp !== '1234') {
            throw new Error('Invalid OTP. Please enter 1234.');
        }

        let user = MOCK_USERS.find(u => u.phone === phone);
        const isNewUser = !user;

        if (!user) {
            const isIntermediary = phone.endsWith('2222');
            user = {
                id: Date.now(),
                role: isIntermediary ? 'INTERMEDIARY' : 'FARMER',
                phone,
                name: isIntermediary ? 'Rajesh Kumar' : 'Suresh Kisan',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_USERS.push(user);
        }

        const token = `mock-jwt-token-${Date.now()}`;
        ApiClient.setToken(token);

        return { user, token, isNewUser };
    }

    /**
     * MOCK: Create Farmer or Intermediary profile
     */
    async createProfile(
        userId: number,
        role: 'FARMER' | 'INTERMEDIARY',
        data: any
    ): Promise<Farmer | Intermediary> {
        await delay(1000);

        if (role === 'FARMER') {
            const farmer: Farmer = {
                id: Date.now(),
                userId,
                address: data.address,
                district: data.district,
                state: data.state,
                pincode: data.pincode,
                landHolding: data.landHolding,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_FARMERS.push(farmer);
            return farmer;
        } else {
            const intermediary: Intermediary = {
                id: Date.now(),
                userId,
                businessName: data.businessName,
                businessType: data.businessType,
                gstNumber: data.gstNumber,
                address: data.address,
                district: data.district,
                state: data.state,
                pincode: data.pincode,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_INTERMEDIARIES.push(intermediary);
            return intermediary;
        }
    }

    /**
     * MOCK: Get user's profile
     */
    async getMyProfile(
        userId: number,
        role: 'FARMER' | 'INTERMEDIARY'
    ): Promise<Farmer | Intermediary | null> {
        await delay(500);
        if (role === 'FARMER') {
            return MOCK_FARMERS.find(f => f.userId === userId) || null;
        } else {
            return MOCK_INTERMEDIARIES.find(i => i.userId === userId) || null;
        }
    }

    async logout(): Promise<void> {
        ApiClient.setToken(null);
    }

    isRoleAllowedInApp(user: User): boolean {
        return user.role === 'FARMER' || user.role === 'INTERMEDIARY';
    }
}

export default new AuthService();
