import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

// Use a fallback client ID if not set (for development)
if (!clientId) {
  console.warn("⚠️ NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Please set it in your .env.local file.");
}

export const client = createThirdwebClient({
  clientId: clientId || "demo-key",
});
