export type Role = 'FARMER' | 'INTERMEDIARY';

export interface User {
    id: string;
    name: string;
    phone: string;
    role: Role;
    avatar?: string;

    // Farmer-specific basic fields
    farmLocation?: string;
    farmSize?: string;

    // Comprehensive onboarding fields
    linkedKaId?: string;
    idProof?: { type: 'PAN' | 'AADHAR' | 'KISAN_PATRA'; number: string };
    accountDetails?: { bankName: string; accountNumber: string; ifsc: string };
    nomineeDetails?: { name: string; relation: string; contact: string };
    email?: string;
    district?: string;
    tehsil?: string;
    commodity?: string; // Free text for now
    landHolding?: string;
    farmerId?: string; // Auto-generated unique ID
    fatherName?: string;
    profileCompleted?: boolean; // Track if full profile is complete

    // Intermediary-specific fields
    experience?: string; // Years of experience
    rating?: number; // Performance rating (1-5)
    kaId?: string; // KA ID (renamed from linkedKaId for intermediaries)
}

export type EnquiryStatus = 'CREATED' | 'IN_PROGRESS' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export interface Enquiry {
    id: string;
    createdById: string;
    farmerId: string;
    farmerName: string;

    // Basic fields (legacy)
    product: string;
    quantity: string;
    expectedPrice: string;

    // Comprehensive purchase order fields
    // Mandatory fields (first 10)
    kaLinkedId: string;        // Auto from user
    date: string;              // Auto timestamp
    location: string;
    state: string;
    commodity: string;
    quantityMT: string;        // Metric Tons
    rateMT: string;            // Rate per MT
    cdPercent: string;         // Cash Discount %
    bagPacking: string;
    financePercent: string;

    // Optional fields
    gstPercent?: string;
    purchaseDays?: string;     // Completion days
    purchaseConditions?: string;
    paymentConditions?: string;
    qcParameters?: string;
    pickupLocation?: string;
    qcParametersFarmer?: string;
    images?: string[];         // Image URIs/URLs (max 2)
    remarks?: string;

    // Status tracking
    status: EnquiryStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
}

export interface FarmerProfile {
    id: string;
    name: string;
    phone: string;
    location: string;
    farmSize: string;
    primaryCrops: string[];
    onboardedById?: string; // ID of the Intermediary who onboarded them
    joinedAt: string;
}

export interface AuthResponse {
    user?: User;
    token?: string;
    isNewUser?: boolean;
}
