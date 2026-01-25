/**
 * Cropmart Backend API Client
 * 
 * Base URL: https://cropmart-backend.onrender.com/v1
 * 
 * This service provides type-safe API calls that EXACTLY match
 * the backend endpoints. DO NOT add endpoints that don't exist.
 */

import {
    Farmer,
    Intermediary,
    PurchaseEnquiry,
    RequestOtpRequest,
    RequestOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    CreateEnquiryRequest,
    UpdateEnquiryStatusRequest,
    UpdateFarmerRequest,
    UpdateIntermediaryRequest,
    ApiError,
} from './types';

const API_BASE_URL = 'https://cropmart-backend.onrender.com/v1';

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: any = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const contentType = response.headers.get('content-type');
            let data: any;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }

            if (!response.ok) {
                const error: ApiError = data;
                throw new Error(error.message || `API request failed with status ${response.status}`);
            }

            return data as T;
        } catch (error: any) {
            console.warn(`[ApiClient] Request to ${endpoint} failed:`, error.message);
            throw error;
        }
    }

    // ============================================================================
    // SECTION 1: Authentication APIs
    // ============================================================================

    async requestOtp(data: RequestOtpRequest): Promise<RequestOtpResponse> {
        return this.request<RequestOtpResponse>('/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
        return this.request<VerifyOtpResponse>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ============================================================================
    // SECTION 2: Farmer APIs
    // ============================================================================

    async getFarmers(): Promise<Farmer[]> {
        return this.request<Farmer[]>('/farmers');
    }

    async getFarmer(id: number): Promise<Farmer> {
        return this.request<Farmer>(`/farmers/${id}`);
    }

    async updateFarmer(id: number, data: UpdateFarmerRequest): Promise<Farmer> {
        return this.request<Farmer>(`/farmers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // ============================================================================
    // SECTION 3: Intermediary APIs
    // ============================================================================

    async getIntermediary(id: number): Promise<Intermediary> {
        return this.request<Intermediary>(`/intermediaries/${id}`);
    }

    async updateIntermediary(
        id: number,
        data: UpdateIntermediaryRequest
    ): Promise<Intermediary> {
        return this.request<Intermediary>(`/intermediaries/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // ============================================================================
    // SECTION 4: Purchase Enquiry APIs
    // ============================================================================

    async getEnquiries(): Promise<PurchaseEnquiry[]> {
        return this.request<PurchaseEnquiry[]>('/enquiries');
    }

    async getEnquiry(id: number): Promise<PurchaseEnquiry> {
        return this.request<PurchaseEnquiry>(`/enquiries/${id}`);
    }

    async createEnquiry(data: CreateEnquiryRequest): Promise<PurchaseEnquiry> {
        return this.request<PurchaseEnquiry>('/enquiries', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateEnquiryStatus(
        id: number,
        data: UpdateEnquiryStatusRequest
    ): Promise<PurchaseEnquiry> {
        return this.request<PurchaseEnquiry>(`/enquiries/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

export default new ApiClient();
