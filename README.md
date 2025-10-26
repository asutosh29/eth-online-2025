# 🔒 Decentralized Inheritance Switch 🚀

**Securely manage your digital legacy on the blockchain. Ensure your assets reach your loved ones, automatically and trustlessly.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Blockchain](https://img.shields.io/badge/Blockchain-Sepolia-blueviolet)](https://sepolia.etherscan.io/)
[![Stablecoin](https://img.shields.io/badge/Stablecoin-%24PYUSD-blue)](https://www.paypal.com/pyusd)
[![Storage](https://img.shields.io/badge/Storage-Lighthouse-F05E7A)](https://www.lighthouse.storage/)

---

## 🌟 Overview

The Decentralized Inheritance Switch is a cutting-edge DApp built on the blockchain that revolutionizes digital inheritance. It acts as a sophisticated, automated **"Dead Man's Switch,"** ensuring the secure transfer of digital assets ($PYUSD$ stablecoins) and optionally private data (like wills or access keys) to a designated beneficiary if the owner becomes inactive.

In an increasingly digital world, passing on assets like stablecoins, NFTs, or critical access information securely and reliably is a major challenge. Traditional methods are slow, costly, and rely on intermediaries. Our solution leverages blockchain, stablecoins, and decentralized storage to create a **trustless, transparent, and automated** inheritance process.

---

## ✨ Core Features

* **Dead Man's Switch Logic:** Owners lock assets in a smart contract and must periodically "check in" on-chain (e.g., every 6 months) to signal activity.
* **Automated Asset Transfer:** If the owner fails to check in within the specified period, the designated beneficiary can claim the locked assets directly from the contract.
* **Stablecoin Integration ($PYUSD$):** Uses PayPal USD for asset locking, ensuring the inherited value remains stable and predictable, pegged 1:1 to the US dollar.
* **Optional Encrypted Data:** Owners can attach encrypted messages (wills, instructions, private keys) stored permanently on **Lighthouse** decentralized storage. The storage CID is linked on-chain.
* **Decentralized & Trustless:** Operates entirely on the blockchain (Sepolia testnet) without intermediaries, ensuring security and censorship resistance.
* **Beneficiary Verification:** The smart contract rigorously verifies the beneficiary's identity before releasing funds.
* **Owner Control:** Owners can update the beneficiary or cancel the switch and reclaim assets at any time while active.

---

## 🛠️ Technology Stack

* **Smart Contract:**
    * Language: **Solidity** (^0.8.x)
    * Framework: **Hardhat**
    * Network: **Sepolia Testnet**
    * Token Standard: **ERC-20 ($PYUSD$)**
* **Frontend:**
    * Framework: **Next.js / React**
    * Blockchain Interaction: **Thirdweb SDK / Ethers.js**
    * Wallet Integration: **MetaMask / Thirdweb Connect**
    * Decentralized Storage: **Lighthouse SDK**
    * UI: **Tailwind CSS, Shadcn/ui**
* **Services:**
    * Decentralized Storage: **Lighthouse**
    * Stablecoin: **PayPal USD ($PYUSD$)**

---

## 🌊 User Flow

1.  **Owner Setup:**
    * Connects wallet to the DApp.
    * Navigates to "Create Switch."
    * Specifies beneficiary address, $PYUSD$ amount, and check-in timeout period (e.g., 180 days).
    * *Optionally:* Writes a private message, which the frontend encrypts and uploads to Lighthouse, retrieving a CID.
    * Approves the $PYUSD$ transfer.
    * Initializes the switch via a smart contract transaction. If a message was added, a second transaction updates the data pointer with the CID.
2.  **Owner Check-in:**
    * Periodically connects wallet.
    * Navigates to their switch status.
    * Clicks "Check In," sending a transaction to update their `lastCheckIn` timestamp on the contract.
3.  **Beneficiary Claim:**
    * After the timeout period expires without an owner check-in (`isClaimable` becomes true).
    * The beneficiary connects their wallet.
    * Navigates to the owner's switch status page.
    * Clicks "Claim Assets".
    * The smart contract verifies the conditions and beneficiary identity.
    * If valid, the contract transfers $PYUSD$ to the beneficiary and deactivates the switch.
4.  **Data Access (Beneficiary):**
    * The beneficiary retrieves the CID from the contract details (or claim event).
    * Uses the CID to download the encrypted data blob from Lighthouse.
    * Decrypts the data using a pre-shared key or method established off-chain.

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd decentralized-inheritance-switch
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add the following:
    ```env
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
    NEXT_PUBLIC_INHERITANCE_SWITCH_ADDRESS=your_deployed_contract_address_on_sepolia
    NEXT_PUBLIC_PYUSD_ADDRESS=pyusd_contract_address_on_sepolia
    LIGHTHOUSE_API_KEY=your_lighthouse_api_key
    ```
    * Get a Thirdweb Client ID from [thirdweb.com/dashboard](https://thirdweb.com/dashboard).
    * Deploy the `InheritanceSwitch.sol` contract to Sepolia using Hardhat.
    * Find the $PYUSD$ contract address on Sepolia Etherscan.
    * Get a Lighthouse API key from [docs.lighthouse.storage](https://docs.lighthouse.storage/get-started/get-api-key).
4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
5.  **Open your browser** to `http://localhost:3000`.

---

## 💡 Why This Matters

* **Security:** Eliminates single points of failure and reliance on traditional intermediaries.
* **Automation:** Ensures asset transfer according to predefined rules, executed immutably by the smart contract.
* **Privacy:** Optional sensitive data is encrypted client-side and stored decentrally.
* **Stability:** Using $PYUSD$ protects the inheritance value from market volatility.
* **Cost-Effectiveness:** Leverages blockchain efficiency and Lighthouse's permanent storage model.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.