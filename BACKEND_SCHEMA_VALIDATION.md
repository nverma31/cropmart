# Backend Schema Alignment Validation Summary

**Date**: 2026-01-25  
**Backend URL**: https://cropmart-backend.onrender.com/v1  
**Status**: ✅ ALIGNED

---

## Data Models Created

### 1. User Model ✅
**Location**: `src/services/api/types.ts`

```typescript
interface User {
  id: number;
  role: 'ADMIN' | 'FARMER' | 'INTERMEDIARY';
  phone?: string;
  email?: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Validation**:
- ✅ All backend fields included
- ✅ No extra fields added
- ✅ Correct types (number for id, not string)
- ✅ Optional fields marked correctly
- ✅ ADMIN role included but app logic excludes it

---

### 2. Farmer Model ✅
**Location**: `src/services/api/types.ts`

```typescript
interface Farmer {
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
```

**Validation**:
- ✅ Separate from User (not embedded)
- ✅ All backend fields included
- ✅ No extra fields added
- ✅ Nullable fields handled correctly
- ✅ Foreign key relationships preserved (userId, intermediaryId)

---

### 3. Intermediary Model ✅
**Location**: `src/services/api/types.ts`

```typescript
interface Intermediary {
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
```

**Validation**:
- ✅ Separate from User (not embedded)
- ✅ All backend fields included
- ✅ No extra fields added
- ✅ All fields optional except id, userId, timestamps

---

### 4. PurchaseEnquiry Model ✅
**Location**: `src/services/api/types.ts`

```typescript
interface PurchaseEnquiry {
  id: number;
  farmerId: number;
  intermediaryId?: number;
  createdByUserId: number;
  productType: string;
  quantity: number;
  quantityUnit: string;
  expectedPrice: number;
  status: 'CREATED' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL';
  notes?: string;
  enquiryDate?: string;
  location?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Validation**:
- ✅ All backend fields included
- ✅ No extra fields added
- ✅ Correct types (quantity and expectedPrice are numbers, not strings)
- ✅ Status enums match backend exactly
- ✅ Foreign key relationships preserved

---

## API Endpoints Implemented

### Authentication ✅
- `POST /auth/request-otp` ✅
- `POST /auth/verify-otp` ✅

### Farmers ✅
- `GET /farmers/:id` ✅
- `PATCH /farmers/:id` ✅

### Intermediaries ✅
- `GET /intermediaries/:id` ✅
- `PATCH /intermediaries/:id` ✅

### Enquiries ✅
- `GET /enquiries` ✅
- `GET /enquiries/:id` ✅
- `POST /enquiries` ✅
- `PATCH /enquiries/:id/status` ✅

**Validation**:
- ✅ All endpoints match backend exactly
- ✅ No extra endpoints added
- ✅ Correct HTTP methods
- ✅ Request/response types aligned

---

## Fields Removed from Legacy Schema

The following fields were in the old draft schema but are **NOT** in the actual backend:

### From User:
- ❌ `avatar` - Not in backend
- ❌ `farmLocation` - Moved to Farmer entity
- ❌ `farmSize` - Moved to Farmer entity
- ❌ `linkedKaId` - Not in backend
- ❌ `idProof` - Not in backend
- ❌ `accountDetails` - Not in backend
- ❌ `nomineeDetails` - Not in backend
- ❌ `tehsil` - Not in backend
- ❌ `commodity` - Not in backend
- ❌ `farmerId` - Not in backend
- ❌ `fatherName` - Not in backend
- ❌ `profileCompleted` - Not in backend
- ❌ `experience` - Not in backend
- ❌ `rating` - Not in backend
- ❌ `kaId` - Not in backend

### From Enquiry:
- ❌ `farmerName` - Not in backend (denormalized field)
- ❌ `product` - Changed to `productType`
- ❌ `kaLinkedId` - Not in backend
- ❌ `date` - Changed to `enquiryDate`
- ❌ `commodity` - Not in backend
- ❌ `quantityMT` - Simplified to `quantity` + `quantityUnit`
- ❌ `rateMT` - Simplified to `expectedPrice`
- ❌ `cdPercent` - Not in backend
- ❌ `bagPacking` - Not in backend
- ❌ `financePercent` - Not in backend
- ❌ `gstPercent` - Not in backend
- ❌ `purchaseDays` - Not in backend
- ❌ `purchaseConditions` - Not in backend
- ❌ `paymentConditions` - Not in backend
- ❌ `qcParameters` - Not in backend
- ❌ `pickupLocation` - Not in backend
- ❌ `qcParametersFarmer` - Not in backend
- ❌ `images` - Not in backend
- ❌ `remarks` - Changed to `notes`

### Removed Entities:
- ❌ `FarmerProfile` - Backend uses `Farmer` instead

---

## Role-Based Behavior Constraints

### Farmer App Capabilities ✅
- ✅ OTP login
- ✅ View/edit own Farmer profile
- ✅ Create purchase enquiries
- ✅ View own enquiries and statuses

### Intermediary App Capabilities ✅
- ✅ OTP login
- ✅ View/edit own Intermediary profile
- ✅ View assigned enquiries
- ✅ Update enquiry status only

### Explicitly Forbidden ✅
- ✅ Admin functionality excluded
- ✅ No manual user creation (OTP only)
- ✅ No enquiry content editing
- ✅ No cross-user/cross-role access

---

## Error Handling ✅

Implemented in `ApiClient.ts`:
- ✅ 401/403 handling (throws error for auth middleware)
- ✅ Partial profile handling (all fields optional)
- ✅ Empty list handling (returns empty array)
- ✅ Null-safe optional fields
- ✅ Backend responses as single source of truth

---

## Files Created/Modified

1. **`src/services/api/types.ts`** - Complete rewrite ✅
   - All data models aligned with backend
   - No legacy fields
   - Correct TypeScript types

2. **`src/services/api/ApiClient.ts`** - New file ✅
   - All backend endpoints
   - Type-safe API calls
   - JWT token management

3. **`BACKEND_SCHEMA_VALIDATION.md`** - This file ✅
   - Validation summary
   - Field comparison
   - Removed fields documented

---

## Next Steps (NOT in this task)

The following are **intentionally excluded** from this task:

- ❌ UI implementation
- ❌ Business logic
- ❌ State management
- ❌ Navigation updates
- ❌ Form validation
- ❌ Mock data updates

These will be addressed in separate tasks after backend alignment is confirmed.

---

## Confirmation Checklist

- ✅ No fields invented
- ✅ No backend fields ignored
- ✅ No legacy markdown assumptions used
- ✅ All types match backend exactly
- ✅ All endpoints match backend exactly
- ✅ Role-based constraints documented
- ✅ Error handling specified
- ✅ Nullable fields handled correctly

**Status**: Ready for backend integration testing
