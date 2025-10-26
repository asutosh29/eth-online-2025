// src/lib/contracts.ts
import { createThirdwebClient, getContract, ThirdwebClient } from "thirdweb";
import { sepoliaChain } from "@/lib/chains";
import InheritanceSwitchABI from "../contracts/InheritanceSwitchABI.json";
import ERC20ABI from "../contracts/ERC20ABI.json";


const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const INHERITANCE_SWITCH_ADDRESS = process.env.NEXT_PUBLIC_INHERITANCE_SWITCH_ADDRESS;
const PYUSD_ADDRESS = process.env.NEXT_PUBLIC_PYUSD_ADDRESS;

let _client: ThirdwebClient | undefined;
export function getThirdwebClient(): ThirdwebClient {
  if (_client) return _client;

  const clientId = THIRDWEB_CLIENT_ID || "YOUR_THIRDWEB_CLIENT_ID";
  if (!clientId || clientId === "YOUR_THIRDWEB_CLIENT_ID") {
    console.warn("⚠️ NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Please set it in your environment variables.");
  }
  
  _client = createThirdwebClient({
    clientId,
  });
  return _client;
}

export function getContracts() {
  const client = getThirdwebClient();

  const inheritanceAddr = INHERITANCE_SWITCH_ADDRESS;
  const pyusdAddr = PYUSD_ADDRESS;

  const inheritanceSwitch = getContract({
    client,
    chain: sepoliaChain,
    address: inheritanceAddr,
    // pass explicit ABI for type-safety/autocomplete for all methods/events
    abi: InheritanceSwitchABI as any,
  });

  const pyusd = getContract({
    client,
    chain: sepoliaChain,
    address: pyusdAddr,
    abi: ERC20ABI as any,
  });

  return { client, inheritanceSwitch, pyusd };
}

/**
 * Example usage:
 *
 * import { getContracts } from "src/lib/contracts";
 *
 * const { inheritanceSwitch, pyusd } = getContracts();
 *
 * // prepare a read call (type-safe if you provided full ABI)
 * const tx = inheritanceSwitch.read.getMySwitchDetails?.();
 *
 * // or prepare a contract call for sending
 * import { prepareContractCall, sendTransaction } from "thirdweb";
 * const prepared = prepareContractCall({
 *   contract: inheritanceSwitch,
 *   method: "function checkIn()",
 *   params: [],
 * });
 * // then sendTransaction({ transaction: prepared, account })
 *
 * Note: In a React app using thirdweb/react, you can instead use the provided hooks
 * (useContract / useReadContract / useContractWrite / useSendTransaction) for wallet-connected flows.
 */

export type Contracts = ReturnType<typeof getContracts>;
