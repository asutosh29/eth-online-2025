/**
 * Helper functions to interact with the Lighthouse IPFS storage API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Upload encrypted data to Lighthouse IPFS
 * @param encryptedData - The encrypted data string to upload
 * @returns The CID (Content Identifier) for the uploaded data
 */
export async function uploadToLighthouse(encryptedData: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lighthouse/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: encryptedData }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.cid;
  } catch (error) {
    console.error('Error uploading to Lighthouse:', error);
    throw error;
  }
}

/**
 * Fetch data from Lighthouse IPFS by CID
 * @param cid - The Content Identifier to fetch
 * @returns The data stored at the CID
 */
export async function fetchFromLighthouse(cid: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lighthouse/fetch/${cid}`);

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching from Lighthouse:', error);
    throw error;
  }
}

/**
 * Update the data CID in the inheritance switch contract
 * @param newCID - The new Content Identifier
 */
export async function updateDataCID(newCID: string, contract: any, account: any) {
  // This would be called when you have the contract and account available
  // Use prepareContractCall and sendTransaction from your existing setup
  console.log('Would update data CID to:', newCID);
  // Implementation would go here based on your contract interaction setup
}
