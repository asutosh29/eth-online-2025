# Summary of Frontend Updates

## ✅ Changes Implemented

### 1. Variable Timeout Period Support

**File:** `src/app/create-switch/page.tsx`

**Changes:**
- Added `timeoutPeriod` state to capture user input for timeout period in days
- Added input field in the UI for timeout period (default: 180 days)
- Updated `handleCreateSwitch()` to:
  - Convert timeout from days to seconds
  - Pass `timeoutInSeconds` as the third parameter to `initializeSwitch()`
  - The contract now accepts: `(beneficiary, amount, timeoutPeriod)`

**New UI Elements:**
- Timeout input field with validation
- Helper text explaining the timeout mechanism

### 2. Lighthouse Integration for Inheritance Messages

**File:** `src/app/create-switch/page.tsx`

**Changes:**
- Added `willMessage` state to capture inheritance message
- Added textarea input field in the UI for optional will/message
- Updated `handleCreateSwitch()` to:
  - Upload will message to Lighthouse IPFS if provided
  - Get CID from Lighthouse upload
  - Create the switch on blockchain
  - Call `updateDataPointer(CID)` after switch creation to store the CID

**New UI Elements:**
- Will/inheritance message textarea
- Helper text explaining IPFS storage
- Automatic CID upload and storage

### 3. Enhanced Status Page with 3 Scenarios

**File:** `src/app/status/[address]/page.tsx`

**Changes:**

#### a) Beneficiary Detection
- Added `useReadContract` hook to call `isBeneficiary(ownerAddress)`
- Checks if the connected account is the beneficiary of the viewed switch
- Shows "You are the beneficiary" alert when applicable

#### b) Owner Checking Own Switch
- Uses existing `getMySwitchDetails()` for owners
- Shows "You are the owner" alert
- Displays full switch information

#### c) Guest/Public Viewing
- Shows "You are viewing as a guest" alert
- Displays only public information:
  - Status (Active/Inactive)
  - Locked Amount
  - Data CID
  - Claimable status
- Hides private information (beneficiary, last check-in)

**New Display Logic:**
- Relationship-based alerts (Owner/Beneficiary/Guest)
- Conditional information display based on relationship
- Better UX for different user roles

## 📋 Contract Function Updates

### Updated Function: `initializeSwitch`
**Old Signature:**
```solidity
function initializeSwitch(address _beneficiary, uint256 _pyusdAmount)
```

**New Signature:**
```solidity
function initializeSwitch(
    address _beneficiary, 
    uint256 _pyusdAmount, 
    uint256 _timeOutPeriod
)
```

### New Function: `isBeneficiary`
```solidity
function isBeneficiary(address _ownerAddress) public view returns (bool)
```
- Public function to check if msg.sender is the beneficiary of a given owner's switch

## 🔄 API Routes Created

### 1. Upload Endpoint
**File:** `src/app/api/lighthouse/upload/route.ts`
- **Method:** POST
- **Body:** `{ data: "encrypted string" }`
- **Returns:** `{ cid: "Qm..." }`

### 2. Fetch Endpoint
**File:** `src/app/api/lighthouse/fetch/[cid]/route.ts`
- **Method:** GET
- **Param:** CID
- **Returns:** `{ data: "content" }`

## 🎯 User Flows

### Creating a Switch
1. User enters beneficiary address
2. User enters amount in PYUSD
3. **NEW:** User enters timeout period in days
4. **NEW:** User optionally writes inheritance message
5. User approves PYUSD transfer
6. **NEW:** If message provided, upload to Lighthouse and get CID
7. User creates switch with timeout parameter
8. **NEW:** If message provided, update data pointer with CID

### Viewing Switch Status
1. Enter owner address to view
2. Connect wallet (optional)
3. System determines relationship:
   - **Owner:** Shows full details + Check-in button
   - **Beneficiary:** Shows basic info + Claim button (if claimable)
   - **Guest:** Shows only public information

## ⚙️ Environment Variables Required

Add to `.env.local`:
```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_INHERITANCE_SWITCH_ADDRESS=0x...
NEXT_PUBLIC_PYUSD_ADDRESS=0x...
LIGHTHOUSE_API_KEY=your_lighthouse_api_key
```

## 🚀 Next Steps

1. Deploy the updated contract with the new `initializeSwitch` signature
2. Update environment variables with deployed addresses
3. Test the full user flows:
   - Owner creating switch with timeout and message
   - Owner checking in
   - Beneficiary claiming assets
   - Guest viewing switch status
4. Test Lighthouse integration with real API key

