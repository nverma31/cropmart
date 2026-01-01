import { FarmerProfile } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let MOCK_FARMERS: FarmerProfile[] = [
    {
        id: 'farm_001',
        name: 'Suresh Kisan',
        phone: '9876543210',
        location: 'Ludhiana, Punjab',
        farmSize: '15 Acres',
        primaryCrops: ['Wheat', 'Rice'],
        onboardedById: 'int_001',
        joinedAt: '2023-01-15T10:00:00Z',
    },
    {
        id: 'farm_002',
        name: 'Ramesh Singh',
        phone: '9876541111',
        location: 'Patiala, Punjab',
        farmSize: '10 Acres',
        primaryCrops: ['Cotton', 'Wheat'],
        onboardedById: 'int_001',
        joinedAt: '2023-03-20T14:30:00Z',
    },
];

class FarmerService {
    async getMyFarmers(intermediaryId: string): Promise<FarmerProfile[]> {
        await delay(800);
        return MOCK_FARMERS.filter(f => f.onboardedById === intermediaryId);
    }

    async onboardFarmer(farmer: Omit<FarmerProfile, 'id' | 'joinedAt'>): Promise<FarmerProfile> {
        await delay(1200);
        const newFarmer: FarmerProfile = {
            ...farmer,
            id: `farm_${Date.now()}`,
            joinedAt: new Date().toISOString(),
        };
        MOCK_FARMERS.push(newFarmer);
        return newFarmer;
    }
}

export default new FarmerService();
