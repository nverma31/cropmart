/**
 * Farmer Service
 */

import ApiClient from './ApiClient';
import { Farmer, UpdateFarmerRequest } from './types';

const MOCK_FARMERS: Farmer[] = [
    {
        id: 1,
        userId: 101,
        address: 'Main Street 1',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001',
        landHolding: '10 Acres',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

class FarmerService {
    async getFarmers(): Promise<Farmer[]> {
        try {
            return await ApiClient.getFarmers();
        } catch (error) {
            console.warn('[FarmerService] Falling back to mock farmers');
            return MOCK_FARMERS;
        }
    }

    async getFarmer(id: number): Promise<Farmer> {
        try {
            return await ApiClient.getFarmer(id);
        } catch (error) {
            const mock = MOCK_FARMERS.find(f => f.id === id);
            if (mock) return mock;
            throw error;
        }
    }

    async updateFarmer(id: number, data: UpdateFarmerRequest): Promise<Farmer> {
        try {
            return await ApiClient.updateFarmer(id, data);
        } catch (error) {
            const index = MOCK_FARMERS.findIndex(f => f.id === id);
            if (index !== -1) {
                MOCK_FARMERS[index] = { ...MOCK_FARMERS[index], ...data };
                return MOCK_FARMERS[index];
            }
            throw error;
        }
    }
}

export default new FarmerService();
