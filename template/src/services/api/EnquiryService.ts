import { Enquiry, EnquiryStatus } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data - Note: New fields added but with placeholder values for backwards compatibility
let MOCK_ENQUIRIES: Enquiry[] = [
    {
        id: 'enq_1',
        createdById: 'farm_001',
        farmerId: 'farm_001',
        farmerName: 'Suresh Kisan',
        product: 'Wheat (Sharbati)',
        quantity: '50 Quintals',
        expectedPrice: '2200 / Quintal',
        kaLinkedId: 'KA001',
        date: new Date().toISOString(),
        location: 'Mandi Yard, Ludhiana',
        state: 'Punjab',
        commodity: 'Wheat',
        quantityMT: '5',
        rateMT: '2200',
        cdPercent: '2',
        bagPacking: '50kg HDPE',
        financePercent: '10',
        status: 'CREATED',
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'enq_2',
        createdById: 'int_001',
        farmerId: 'farm_002',
        farmerName: 'Ramesh Singh',
        product: 'Basmati Rice',
        quantity: '100 Quintals',
        expectedPrice: '3500 / Quintal',
        kaLinkedId: 'KA002',
        date: new Date(Date.now() - 86400000).toISOString(),
        location: 'Storage Unit B',
        state: 'Haryana',
        commodity: 'Rice',
        quantityMT: '10',
        rateMT: '3500',
        cdPercent: '1.5',
        bagPacking: '25kg PP',
        financePercent: '15',
        status: 'IN_PROGRESS',
        paymentStatus: 'PARTIAL',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
];

class EnquiryService {
    async getEnquiries(userRole: 'FARMER' | 'INTERMEDIARY', userId: string): Promise<Enquiry[]> {
        await delay(1000);
        if (userRole === 'FARMER') {
            // Farmer sees only their own
            return MOCK_ENQUIRIES.filter(e => e.farmerId === userId);
        } else {
            // Intermediary sees everything they created OR linked to their farmers (mocking "all" for now or filtered by creator)
            // For this mock, Intermediary sees everything to verify "Managed Farmers" flow
            return MOCK_ENQUIRIES;
        }
    }

    async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): Promise<Enquiry> {
        await delay(1000);
        const newEnquiry: Enquiry = {
            ...enquiry,
            id: `enq_${Date.now()}`,
            status: 'CREATED',
            paymentStatus: 'PENDING',
            createdAt: new Date().toISOString(),
        };
        MOCK_ENQUIRIES.unshift(newEnquiry);
        return newEnquiry;
    }

    // Bulk creation for Intermediaries
    async createBulkEnquiries(data: {
        // Legacy fields
        product: string;
        quantity: string;
        expectedPrice: string;

        // Comprehensive fields
        kaLinkedId: string;
        date: string;
        location: string;
        state: string;
        commodity: string;
        quantityMT: string;
        rateMT: string;
        cdPercent: string;
        bagPacking: string;
        financePercent: string;
        gstPercent?: string;
        purchaseDays?: string;
        purchaseConditions?: string;
        paymentConditions?: string;
        qcParameters?: string;
        pickupLocation?: string;
        qcParametersFarmer?: string;
        images?: string[];
        remarks?: string;

        farmerIds: string[];
        createdById: string;
    }): Promise<Enquiry[]> {
        await delay(1500);

        // In production, this would be a POST request to your backend API:
        // const response = await fetch('/api/enquiries/bulk', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        //     body: JSON.stringify(data)
        // });
        // return response.json();

        const newEnquiries: Enquiry[] = data.farmerIds.map(fId => ({
            id: `enq_${Date.now()}_${fId}`,
            createdById: data.createdById,
            farmerId: fId,
            farmerName: `Farmer ${fId}`,

            // Legacy fields
            product: data.product,
            quantity: data.quantity,
            expectedPrice: data.expectedPrice,

            // Comprehensive fields
            kaLinkedId: data.kaLinkedId,
            date: data.date,
            location: data.location,
            state: data.state,
            commodity: data.commodity,
            quantityMT: data.quantityMT,
            rateMT: data.rateMT,
            cdPercent: data.cdPercent,
            bagPacking: data.bagPacking,
            financePercent: data.financePercent,
            gstPercent: data.gstPercent,
            purchaseDays: data.purchaseDays,
            purchaseConditions: data.purchaseConditions,
            paymentConditions: data.paymentConditions,
            qcParameters: data.qcParameters,
            pickupLocation: data.pickupLocation,
            qcParametersFarmer: data.qcParametersFarmer,
            images: data.images,
            remarks: data.remarks,

            status: 'CREATED',
            paymentStatus: 'PENDING',
            createdAt: new Date().toISOString(),
        }));

        MOCK_ENQUIRIES = [...newEnquiries, ...MOCK_ENQUIRIES];
        return newEnquiries;
    }
}

export default new EnquiryService();
