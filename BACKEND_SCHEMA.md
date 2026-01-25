# CropMart Backend Schema Requirements

## Overview
This document outlines the data models and relationships for the CropMart application, which connects Farmers with Intermediaries for agricultural commodity trading.

---

## 1. User Entity

### Schema
```typescript
User {
  id: string (UUID/ObjectId)
  name: string
  phone: string (unique, indexed)
  role: 'FARMER' | 'INTERMEDIARY'
  avatar?: string (URL)
  email?: string
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
  
  // Role-specific fields (conditional based on role)
  
  // FARMER-specific fields:
  farmLocation?: string
  farmSize?: string
  linkedKaId?: string (KA ID they're linked to)
  idProof?: {
    type: 'PAN' | 'AADHAR' | 'KISAN_PATRA'
    number: string
  }
  accountDetails?: {
    bankName: string
    accountNumber: string
    ifsc: string
  }
  nomineeDetails?: {
    name: string
    relation: string
    contact: string
  }
  district?: string
  tehsil?: string
  commodity?: string (free text)
  landHolding?: string
  farmerId?: string (auto-generated unique ID)
  fatherName?: string
  profileCompleted?: boolean
  
  // INTERMEDIARY-specific fields:
  experience?: string (years)
  rating?: number (1-5)
  kaId?: string (their own KA ID)
}
```

### Indexes
- `phone` (unique)
- `role`
- `linkedKaId` (for farmers)
- `kaId` (for intermediaries)

### Business Rules
- Phone number must be unique across the system
- Role determines which fields are required/visible
- Farmers can be linked to one Intermediary via `linkedKaId`
- Intermediaries have their own `kaId`

---

## 2. FarmerProfile Entity

### Schema
```typescript
FarmerProfile {
  id: string (UUID/ObjectId)
  name: string
  phone: string
  location: string
  farmSize: string
  primaryCrops: string[] (array of crop names)
  onboardedById?: string (reference to Intermediary User.id)
  joinedAt: timestamp
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Relationships
- **Many-to-One**: Multiple FarmerProfiles can be onboarded by one Intermediary
  - `FarmerProfile.onboardedById` → `User.id` (where User.role = 'INTERMEDIARY')

### Indexes
- `onboardedById`
- `phone`

### Business Rules
- Created when an Intermediary onboards a new farmer
- `onboardedById` links to the Intermediary who onboarded them
- This is separate from the main User entity to track onboarding relationships

---

## 3. Enquiry Entity (Purchase Order)

### Schema
```typescript
Enquiry {
  id: string (UUID/ObjectId)
  
  // Relationships
  createdById: string (reference to User.id - can be Farmer or Intermediary)
  farmerId: string (reference to User.id where role='FARMER')
  farmerName: string (denormalized for quick access)
  
  // Legacy fields (kept for backwards compatibility)
  product: string
  quantity: string
  expectedPrice: string
  
  // Comprehensive Purchase Order Fields
  // === MANDATORY FIELDS (First 10) ===
  kaLinkedId: string (auto-populated from user)
  date: timestamp (auto-generated)
  location: string
  state: string
  commodity: string
  quantityMT: string (Metric Tons)
  rateMT: string (Rate per MT)
  cdPercent: string (Cash Discount %)
  bagPacking: string
  financePercent: string
  
  // === OPTIONAL FIELDS ===
  gstPercent?: string
  purchaseDays?: string (completion days)
  purchaseConditions?: string
  paymentConditions?: string
  qcParameters?: string (Quality Control parameters)
  pickupLocation?: string
  qcParametersFarmer?: string (Farmer-specific QC parameters)
  images?: string[] (max 2 image URLs)
  remarks?: string
  
  // Status tracking
  status: 'CREATED' | 'IN_PROGRESS' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID'
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Relationships
- **Many-to-One**: Multiple Enquiries can be created by one User (Farmer or Intermediary)
  - `Enquiry.createdById` → `User.id`
- **Many-to-One**: Multiple Enquiries can be associated with one Farmer
  - `Enquiry.farmerId` → `User.id` (where User.role = 'FARMER')

### Indexes
- `createdById`
- `farmerId`
- `status`
- `paymentStatus`
- `createdAt` (for sorting)
- Compound index: `(farmerId, status)`
- Compound index: `(createdById, status)`

### Business Rules
- `createdById` can be either a Farmer (creating their own enquiry) or an Intermediary (creating on behalf of farmers)
- `farmerId` always references the farmer the enquiry is for
- When an Intermediary creates bulk enquiries, one Enquiry record is created per farmer
- `kaLinkedId` is auto-populated from the user's profile
- `date` is auto-generated timestamp
- Images array limited to max 2 URLs

---

## 4. Entity Relationships Diagram

```
┌─────────────────┐
│      User       │
│  (role: FARMER) │
└────────┬────────┘
         │
         │ 1
         │
         │ N
┌────────▼────────────┐
│   FarmerProfile     │
│ (onboardedById)     │◄──────┐
└─────────────────────┘       │
                              │ N
                              │
                              │ 1
                    ┌─────────┴──────────┐
                    │       User         │
                    │ (role: INTERMEDIARY)│
                    └─────────┬──────────┘
                              │
                              │ 1
                              │
                              │ N
                    ┌─────────▼──────────┐
                    │     Enquiry        │
                    │  (createdById)     │
                    └────────────────────┘
                              │
                              │ N
                              │
                              │ 1
                    ┌─────────▼──────────┐
                    │       User         │
                    │  (role: FARMER)    │
                    │    (farmerId)      │
                    └────────────────────┘
```

---

## 5. API Endpoints Required

### Authentication
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and login/register
- `POST /auth/register` - Complete registration for new users
- `POST /auth/logout` - Logout user

### Farmers (Intermediary access)
- `GET /farmers/my-farmers` - Get all farmers onboarded by logged-in intermediary
- `POST /farmers/onboard` - Onboard a new farmer

### Enquiries
- `GET /enquiries` - Get enquiries (filtered by user role and ID)
  - For Farmers: Returns only their own enquiries
  - For Intermediaries: Returns all enquiries they created or for their farmers
- `POST /enquiries` - Create single enquiry
- `POST /enquiries/bulk` - Create bulk enquiries (Intermediary only)
  - Accepts array of `farmerIds` and creates one enquiry per farmer

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile

---

## 6. Key Business Logic

### User Registration Flow
1. User enters phone number
2. System sends OTP
3. User verifies OTP
4. If existing user → Login and return user data
5. If new user → Show registration form to collect role and details
6. Create User record with appropriate role-specific fields

### Farmer Onboarding (by Intermediary)
1. Intermediary fills farmer details
2. System creates FarmerProfile with `onboardedById` = Intermediary's ID
3. Optionally creates a User account for the farmer (if they want app access)

### Enquiry Creation
**Single Enquiry (Farmer):**
1. Farmer fills enquiry form
2. System creates Enquiry with `createdById` = Farmer's ID, `farmerId` = Farmer's ID

**Bulk Enquiry (Intermediary):**
1. Intermediary fills enquiry form once
2. Intermediary selects multiple farmers
3. System creates N Enquiry records (one per farmer)
4. Each has `createdById` = Intermediary's ID, `farmerId` = respective Farmer's ID

---

## 7. Data Validation Rules

### User
- `phone`: Must be valid Indian mobile number (10 digits)
- `role`: Required, must be 'FARMER' or 'INTERMEDIARY'
- `email`: Optional, must be valid email format if provided
- `rating`: If provided, must be between 1-5

### Enquiry
- **Mandatory fields**: kaLinkedId, date, location, state, commodity, quantityMT, rateMT, cdPercent, bagPacking, financePercent
- `quantityMT`, `rateMT`, `cdPercent`, `financePercent`: Must be numeric strings
- `images`: Max 2 URLs
- `status`: Must be one of the defined enum values
- `paymentStatus`: Must be one of the defined enum values

### FarmerProfile
- `phone`: Must be valid mobile number
- `primaryCrops`: Array must have at least one crop

---

## 8. Notes for Backend Implementation

1. **Authentication**: Implement JWT-based authentication
2. **Authorization**: Role-based access control (RBAC)
   - Farmers can only access their own data
   - Intermediaries can access their farmers and enquiries
3. **Soft Deletes**: Consider implementing soft deletes for Enquiries
4. **Audit Trail**: Track who created/modified records and when
5. **File Upload**: Implement secure image upload for enquiry images
6. **Pagination**: Implement pagination for list endpoints (especially enquiries)
7. **Search/Filter**: Add search and filter capabilities for enquiries
8. **Notifications**: Consider push notifications for status changes

---

## 9. Sample Data Flow

### Intermediary Creates Bulk Enquiry
```
1. Intermediary (kaId: "KA001") logs in
2. Navigates to Create Enquiry
3. Fills form:
   - commodity: "Wheat"
   - quantityMT: "10"
   - rateMT: "2500"
   - ... (other fields)
4. Selects 3 farmers: [farm_001, farm_002, farm_003]
5. Submits

Backend creates 3 Enquiry records:
- Enquiry 1: createdById="int_001", farmerId="farm_001", kaLinkedId="KA001", ...
- Enquiry 2: createdById="int_001", farmerId="farm_002", kaLinkedId="KA001", ...
- Enquiry 3: createdById="int_001", farmerId="farm_003", kaLinkedId="KA001", ...
```

---

## 10. Migration Considerations

If you have existing data:
- Map legacy `product`, `quantity`, `expectedPrice` fields to new comprehensive fields
- Ensure all existing enquiries have required mandatory fields populated
- Consider data migration script to populate `kaLinkedId` from user profiles
