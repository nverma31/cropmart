/**
 * Enquiry Service
 */

import ApiClient from './ApiClient';
import {
    PurchaseEnquiry,
    CreateEnquiryRequest,
    UpdateEnquiryStatusRequest,
} from './types';

const MOCK_ENQUIRIES: PurchaseEnquiry[] = [
    {
        id: 101,
        farmerId: 1,
        createdByUserId: 1,
        productType: 'Wheat',
        quantity: 50,
        quantityUnit: 'Quintal',
        expectedPrice: 2100,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        location: 'Ludhiana Mandi',
        state: 'Punjab',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

class EnquiryService {
    async getEnquiries(): Promise<PurchaseEnquiry[]> {
        try {
            return await ApiClient.getEnquiries();
        } catch (error) {
            console.warn('[EnquiryService] Falling back to mock enquiries');
            return MOCK_ENQUIRIES;
        }
    }

    async getEnquiry(id: number): Promise<PurchaseEnquiry> {
        try {
            return await ApiClient.getEnquiry(id);
        } catch (error) {
            const mock = MOCK_ENQUIRIES.find(e => e.id === id);
            if (mock) return mock;
            throw error;
        }
    }

    async createEnquiry(data: CreateEnquiryRequest): Promise<PurchaseEnquiry> {
        try {
            return await ApiClient.createEnquiry(data);
        } catch (error) {
            const newEnquiry: PurchaseEnquiry = {
                id: Math.floor(Math.random() * 1000),
                farmerId: data.farmerId || 1,
                createdByUserId: 1,
                productType: data.productType,
                quantity: data.quantity,
                quantityUnit: data.quantityUnit,
                expectedPrice: data.expectedPrice,
                status: 'CREATED',
                paymentStatus: 'PENDING',
                location: data.location,
                state: data.state,
                notes: data.notes,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_ENQUIRIES.push(newEnquiry);
            return newEnquiry;
        }
    }

    async updateEnquiryStatus(id: number, status: UpdateEnquiryStatusRequest['status']): Promise<PurchaseEnquiry> {
        try {
            return await ApiClient.updateEnquiryStatus(id, { status });
        } catch (error) {
            const index = MOCK_ENQUIRIES.findIndex(e => e.id === id);
            if (index !== -1) {
                MOCK_ENQUIRIES[index].status = status;
                return MOCK_ENQUIRIES[index];
            }
            throw error;
        }
    }
}

export default new EnquiryService();
