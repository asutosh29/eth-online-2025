# Lighthouse IPFS API Setup

This document explains how to use the Lighthouse API endpoints for uploading and fetching encrypted data in your inheritance switch application.

## 📦 Installation

The `@lighthouse-web3/sdk` package is already in your `package.json`. If you haven't installed it yet, run:

```bash
pnpm install
```

## 🔑 Environment Variables

Add the following environment variable to your `.env.local` file:

```env
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```

You can get your API key from [Lighthouse Docs](https://docs.lighthouse.storage/get-started/get-api-key)

## 📍 API Endpoints

### 1. Upload Data
**POST** `/api/lighthouse/upload`

Uploads encrypted data to Lighthouse IPFS.

**Request Body:**
```json
{
  "data": "your_encrypted_data_string_here"
}
```

**Response:**
```json
{
  "cid": "Qm...your_cid_here"
}
```

**Usage Example:**
```typescript
import { uploadToLighthouse } from "@/lib/lighthouse";

const encryptedData = "encrypted message here";
const cid = await uploadToLighthouse(encryptedData);
console.log("Uploaded to IPFS with CID:", cid);
```

### 2. Fetch Data
**GET** `/api/lighthouse/fetch/[cid]`

Fetches data from Lighthouse IPFS by CID.

**Response:**
```json
{
  "data": "your_data_string_here"
}
```

**Usage Example:**
```typescript
import { fetchFromLighthouse } from "@/lib/lighthouse";

const cid = "Qm...your_cid_here";
const data = await fetchFromLighthouse(cid);
console.log("Fetched data:", data);
```

## 🔐 Integration with Contract

Here's how to integrate the Lighthouse upload functionality with your inheritance switch:

### 1. When Creating a Switch with Encrypted Message:

```typescript
import { uploadToLighthouse } from "@/lib/lighthouse";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getContracts } from "@/lib/contracts";

function CreateSwitchWithMessage() {
  const { inheritanceSwitch } = getContracts();
  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  const handleCreateSwitchWithMessage = async (
    beneficiary: string,
    amount: string,
    message: string
  ) => {
    // 1. Encrypt your message (implement your encryption logic)
    const encryptedMessage = await encryptMessage(message);
    
    // 2. Upload to Lighthouse
    const cid = await uploadToLighthouse(encryptedMessage);
    
    // 3. Create the switch with the CID
    const tx = prepareContractCall({
      contract: inheritanceSwitch,
      method: "initializeSwitch",
      params: [beneficiary, toUnits(amount, 6)],
    });

    // Wait for transaction to complete...
    
    // 4. Update the data pointer with the CID
    const updateTx = prepareContractCall({
      contract: inheritanceSwitch,
      method: "updateDataPointer",
      params: [cid],
    });
    
    await sendTx(updateTx);
  };

  // ... rest of component
}
```

### 2. Fetching Encrypted Data for Beneficiaries:

```typescript
import { fetchFromLighthouse } from "@/lib/lighthouse";
import { useReadContract } from "thirdweb/react";
import { getContracts } from "@/lib/contracts";

function ViewInheritanceMessage() {
  const { inheritanceSwitch } = getContracts();
  const account = useActiveAccount();

  // Get the data CID from the contract
  const { data: dataCID } = useReadContract({
    contract: inheritanceSwitch,
    method: "getSwitchDataCID",
    params: [account.address],
  });

  // Fetch the encrypted data from Lighthouse
  const [encryptedData, setEncryptedData] = useState<string | null>(null);

  useEffect(() => {
    if (dataCID) {
      fetchFromLighthouse(dataCID)
        .then((data) => {
          setEncryptedData(data);
          // Now decrypt the data
          const decryptedMessage = await decryptMessage(data);
          console.log("Inheritance message:", decryptedMessage);
        })
        .catch(console.error);
    }
  }, [dataCID]);

  return (
    <div>
      {encryptedData && (
        <p>Your inheritance message: {encryptedData}</p>
      )}
    </div>
  );
}
```

## 📁 File Structure

```
src/
├── app/
│   └── api/
│       └── lighthouse/
│           ├── upload/
│           │   └── route.ts          # Upload endpoint
│           └── fetch/
│               └── [cid]/
│                   └── route.ts     # Fetch endpoint
└── lib/
    └── lighthouse.ts                 # Helper functions
```

## 🎯 Quick Start

1. Add `LIGHTHOUSE_API_KEY` to your `.env.local`
2. Import the helper functions in your components
3. Use `uploadToLighthouse()` to upload encrypted data
4. Use `fetchFromLighthouse()` to retrieve data
5. Store the CID in your contract using `updateDataPointer()`

## 🔒 Security Notes

- Always encrypt sensitive data before uploading to Lighthouse
- The data stored on Lighthouse is public, so ensure proper encryption
- Store encryption keys securely (consider using the beneficiary's public key)
- The CID is stored on-chain, making it publicly viewable

## ✅ Testing

Test the endpoints:

```bash
# Upload test
curl -X POST http://localhost:3000/api/lighthouse/upload \
  -H "Content-Type: application/json" \
  -d '{"data":"test encrypted message"}'

# Fetch test
curl http://localhost:3000/api/lighthouse/fetch/YOUR_CID_HERE
```

