/**
 * Intermediary Service
 */

import ApiClient from './ApiClient';
import { Intermediary, UpdateIntermediaryRequest } from './types';

const MOCK_INTERMEDIARIES: Intermediary[] = [
    {
        id: 1,
        userId: 102,
        businessName: 'Growers Hub',
        businessType: 'Wholesale',
        gstNumber: '07AAAAA0000A1Z5',
        address: 'New Market Road',
        district: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

class IntermediaryService {
    async getIntermediary(id: number): Promise<Intermediary> {
        try {
            return await ApiClient.getIntermediary(id);
        } catch (error) {
            const mock = MOCK_INTERMEDIARIES.find(i => i.id === id);
            if (mock) return mock;
            throw error;
        }
    }

    async updateIntermediary(id: number, data: UpdateIntermediaryRequest): Promise<Intermediary> {
        try {
            return await ApiClient.updateIntermediary(id, data);
        } catch (error) {
            const index = MOCK_INTERMEDIARIES.findIndex(i => i.id === id);
            if (index !== -1) {
                MOCK_INTERMEDIARIES[index] = { ...MOCK_INTERMEDIARIES[index], ...data };
                return MOCK_INTERMEDIARIES[index];
            }
            throw error;
        }
    }
}

export default new IntermediaryService();
