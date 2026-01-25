/**
 * Cropmart Backend API Data Models
 * 
 * These types EXACTLY match the backend schema at:
 * https://cropmart-backend.onrender.com/v1
 * 
 * DO NOT modify these types without corresponding backend changes.
 * Last synced: 2026-01-25
 */

// ============================================================================
// SECTION 1: User & Authentication
// ============================================================================

export type UserRole = 'ADMIN' | 'FARMER' | 'INTERMEDIARY';

/**
 * User Entity (Backend Schema)
 */
export interface User {
    id: number;
    role: UserRole;
    phone?: string;
    email?: string;
    name?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Auth Request/Response Types
 */
export interface RequestOtpRequest {
    phone: string;
}

export interface RequestOtpResponse {
    message: string;
}

export interface VerifyOtpRequest {
    phone: string;
    otp: string;
}

export interface VerifyOtpResponse {
    user: User;
    token: string;
    isNewUser?: boolean;
}

// ============================================================================
// SECTION 2: Farmer Profile (Separate from User)
// ============================================================================

/**
 * Farmer Entity (Backend Schema)
 */
export interface Farmer {
    id: number;
    userId: number;
    intermediaryId?: number;
    address?: string;
    district?: string;
    state?: string;
    pincode?: string;
    landHolding?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Farmer Update Request (PATCH)
 */
export interface UpdateFarmerRequest {
    address?: string;
    district?: string;
    state?: string;
    pincode?: string;
    landHolding?: string;
}

// ============================================================================
// SECTION 3: Intermediary Profile (Separate from User)
// ============================================================================

/**
 * Intermediary Entity (Backend Schema)
 */
export interface Intermediary {
    id: number;
    userId: number;
    businessName?: string;
    businessType?: string;
    gstNumber?: string;
    address?: string;
    district?: string;
    state?: string;
    pincode?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Intermediary Update Request (PATCH)
 */
export interface UpdateIntermediaryRequest {
    businessName?: string;
    businessType?: string;
    gstNumber?: string;
    address?: string;
    district?: string;
    state?: string;
    pincode?: string;
}

// ============================================================================
// SECTION 4: Purchase Enquiry (CORE BUSINESS ENTITY)
// ============================================================================

export type EnquiryStatus = 'CREATED' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL';

/**
 * Purchase Enquiry Entity (Backend Schema)
 */
export interface PurchaseEnquiry {
    id: number;
    farmerId: number;
    intermediaryId?: number;
    createdByUserId: number;
    productType: string;
    quantity: number;
    quantityUnit: string;
    expectedPrice: number;
    status: EnquiryStatus;
    paymentStatus: PaymentStatus;
    notes?: string;
    enquiryDate?: string;
    location?: string;
    state?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create Enquiry Request (POST)
 */
export interface CreateEnquiryRequest {
    farmerId?: number;
    productType: string;
    quantity: number;
    quantityUnit: string;
    expectedPrice: number;
    notes?: string;
    enquiryDate?: string;
    location?: string;
    state?: string;
}

/**
 * Update Enquiry Status Request (PATCH - Intermediary/Admin only)
 */
export interface UpdateEnquiryStatusRequest {
    status: EnquiryStatus;
}

// ============================================================================
// SECTION 5: API Response Wrappers
// ============================================================================

/**
 * Standard API Error Response
 */
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

/**
 * Paginated List Response
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================================
// SECTION 6: App-Specific Types (Not from Backend)
// ============================================================================

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface UserProfile {
    user: User;
    farmerProfile?: Farmer;
    intermediaryProfile?: Intermediary;
}
