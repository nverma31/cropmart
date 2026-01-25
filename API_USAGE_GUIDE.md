# Quick Reference: Backend-Aligned API Usage

## Import Services

```typescript
import {
  AuthService,
  FarmerService,
  IntermediaryService,
  EnquiryService,
  // Types
  User,
  Farmer,
  Intermediary,
  PurchaseEnquiry,
} from '@/services/api';
```

---

## Authentication Flow

### 1. Request OTP
```typescript
await AuthService.requestOtp('9876543210');
// OTP sent via SMS
```

### 2. Verify OTP (Login/Register)
```typescript
const response = await AuthService.verifyOtp('9876543210', '1234');
// response.user - User object
// response.token - JWT token (auto-stored in ApiClient)

// Check if role is allowed
if (!AuthService.isRoleAllowedInApp(response.user)) {
  // Redirect to web portal (ADMIN users)
}
```

### 3. Logout
```typescript
await AuthService.logout();
// Clears token from ApiClient
```

---

## Farmer Operations

### Get Farmer Profile
```typescript
const farmer = await FarmerService.getFarmer(farmerId);
// farmer.address, farmer.district, farmer.landHolding, etc.
```

### Update Farmer Profile
```typescript
const updated = await FarmerService.updateFarmer(farmerId, {
  address: 'Village Khanna',
  district: 'Ludhiana',
  state: 'Punjab',
  pincode: '141401',
  landHolding: '15 Acres',
});
```

---

## Intermediary Operations

### Get Intermediary Profile
```typescript
const intermediary = await IntermediaryService.getIntermediary(intermediaryId);
// intermediary.businessName, intermediary.gstNumber, etc.
```

### Update Intermediary Profile
```typescript
const updated = await IntermediaryService.updateIntermediary(intermediaryId, {
  businessName: 'Punjab Agro Traders',
  businessType: 'Wholesale',
  gstNumber: 'GST123456789',
  address: 'Market Road, Ludhiana',
});
```

---

## Enquiry Operations

### Get All Enquiries (Role-Filtered)
```typescript
const enquiries = await EnquiryService.getEnquiries();
// Farmers: Returns only their own enquiries
// Intermediaries: Returns assigned enquiries
```

### Get Single Enquiry
```typescript
const enquiry = await EnquiryService.getEnquiry(enquiryId);
```

### Create Enquiry (Farmer Only)
```typescript
const newEnquiry = await EnquiryService.createEnquiry({
  productType: 'Wheat (Sharbati)',
  quantity: 100,
  quantityUnit: 'Quintal',
  expectedPrice: 2500,
  notes: 'Premium quality, ready for pickup',
  location: 'Mandi Yard, Ludhiana',
  state: 'Punjab',
  enquiryDate: new Date().toISOString(),
});
```

### Update Enquiry Status (Intermediary Only)
```typescript
const updated = await EnquiryService.updateEnquiryStatus(
  enquiryId,
  'APPROVED'
);
// Status options: 'CREATED' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'
```

---

## Error Handling

```typescript
try {
  const enquiries = await EnquiryService.getEnquiries();
} catch (error) {
  if (error.message.includes('401') || error.message.includes('403')) {
    // Unauthorized - force logout
    await AuthService.logout();
    // Navigate to login
  } else {
    // Handle other errors
    console.error('API Error:', error.message);
  }
}
```

---

## Type Safety Examples

### Working with User
```typescript
const user: User = response.user;

// Safe access to optional fields
const phone = user.phone ?? 'No phone';
const email = user.email ?? 'No email';

// Role-based logic
if (user.role === 'FARMER') {
  // Show farmer UI
} else if (user.role === 'INTERMEDIARY') {
  // Show intermediary UI
}
```

### Working with Enquiry
```typescript
const enquiry: PurchaseEnquiry = await EnquiryService.getEnquiry(1);

// All fields are typed
const total = enquiry.quantity * enquiry.expectedPrice;

// Status is enum
if (enquiry.status === 'APPROVED') {
  // Show approved UI
}

// Optional fields
const notes = enquiry.notes ?? 'No notes';
```

---

## Common Patterns

### Check if Profile is Complete
```typescript
function isFarmerProfileComplete(farmer: Farmer): boolean {
  return !!(
    farmer.address &&
    farmer.district &&
    farmer.state &&
    farmer.pincode &&
    farmer.landHolding
  );
}
```

### Get User's Profile Based on Role
```typescript
async function getUserProfile(user: User) {
  if (user.role === 'FARMER') {
    // Assuming farmer.userId === user.id
    const farmer = await FarmerService.getFarmer(farmerId);
    return { user, profile: farmer };
  } else if (user.role === 'INTERMEDIARY') {
    const intermediary = await IntermediaryService.getIntermediary(intermediaryId);
    return { user, profile: intermediary };
  }
  throw new Error('Invalid role');
}
```

### Filter Enquiries by Status
```typescript
const enquiries = await EnquiryService.getEnquiries();
const pending = enquiries.filter(e => e.status === 'PENDING');
const approved = enquiries.filter(e => e.status === 'APPROVED');
```

---

## Important Notes

1. **Authentication**: Token is automatically managed by `ApiClient` after `verifyOtp`
2. **Role Enforcement**: Backend enforces role-based access, not the app
3. **Partial Profiles**: Always check for optional fields before using
4. **Status Updates**: Only status can be updated, not enquiry content
5. **Error Handling**: Always handle 401/403 errors by forcing logout

---

## Backend URL

All API calls go to: `https://cropmart-backend.onrender.com/v1`

This is configured in `src/services/api/ApiClient.ts`
