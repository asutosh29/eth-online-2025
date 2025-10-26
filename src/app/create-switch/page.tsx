"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { 
  useReadContract, 
  useSendTransaction, 
  useActiveAccount 
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { getContracts } from "@/lib/contracts";
import { uploadToLighthouse } from "@/lib/lighthouse";

// Simple utility function to format units
const formatUnits = (value: bigint, decimals: number): string => {
  const divisor = BigInt(Math.pow(10, decimals));
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const formattedFractional = fractionalStr.slice(0, 2);
  
  return `${wholePart}.${formattedFractional}`;
};

export default function CreateSwitchPage() {
  const router = useRouter();
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [timeoutPeriod, setTimeoutPeriod] = useState("");
  const [willMessage, setWillMessage] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  // Get connected account and contract instances
  const account = useActiveAccount();
  const { inheritanceSwitch, pyusd } = getContracts();

  // Fetch PYUSD balance
  const { 
    data: balanceData, 
    isLoading: isLoadingBalance 
  } = useReadContract({
    contract: pyusd,
    method: "balanceOf",
    params: [account?.address || "0x0"],
    queryOptions: {
      enabled: !!account,
    },
  });

  // Fetch current allowance
  const { 
    data: allowanceData, 
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance 
  } = useReadContract({
    contract: pyusd,
    method: "allowance",
    params: [account?.address || "0x0", inheritanceSwitch.address],
    queryOptions: {
      enabled: !!account,
    },
  });

  // Check if user already has an active switch
  const { 
    data: mySwitchDetails, 
    isLoading: isLoadingSwitch 
  } = useReadContract({
    contract: inheritanceSwitch,
    method: "getMySwitchDetails",
    params: [],
    queryOptions: {
      enabled: !!account,
    },
  });

  // Transaction hooks
  const { mutate: sendApproveTx, isPending: isApproving } = useSendTransaction();
  const { mutate: sendCreateTx, isPending: isCreating } = useSendTransaction();

  // Check if user already has an active switch
  useEffect(() => {
    if (mySwitchDetails?.isActive) {
      router.push(`/status/${account?.address}`);
    }
  }, [mySwitchDetails, account, router]);

  // Check if approval is sufficient
  useEffect(() => {
    if (amount && allowanceData) {
      const amountInWei = toUnits(amount, 6);
      setIsApproved(allowanceData >= amountInWei);
    }
  }, [amount, allowanceData]);

  const isConnected = !!account;
  const displayBalance = balanceData ? formatUnits(balanceData, 6) : "0.00";

  // Handle PYUSD approval
  const handleApprove = async () => {
    if (!beneficiary || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    try {
      const amountInWei = toUnits(amount, 6);
      
      const tx = prepareContractCall({
        contract: pyusd,
        method: "approve",
        params: [inheritanceSwitch.address, amountInWei],
      });

      await sendApproveTx(tx);
      alert("Approval successful!");
      // Refresh allowance data
      refetchAllowance();
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed. Please try again.");
    }
  };

  // Handle switch creation
  const handleCreateSwitch = async () => {
    if (!beneficiary || !amount || !timeoutPeriod) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    try {
      const amountInWei = toUnits(amount, 6);
      
      // Convert timeout period from days to seconds
      const timeoutInSeconds = BigInt(parseInt(timeoutPeriod)) * BigInt(86400); // days * seconds per day
      
      // Upload will message to Lighthouse if provided
      let dataCID = "";
      if (willMessage.trim()) {
        console.log("Uploading will message to Lighthouse...");
        dataCID = await uploadToLighthouse(willMessage);
        console.log("Uploaded to IPFS with CID:", dataCID);
      }
      
      // Create the switch with timeout parameter
      const tx = prepareContractCall({
        contract: inheritanceSwitch,
        method: "initializeSwitch",
        params: [beneficiary, amountInWei, timeoutInSeconds],
      });

      await sendCreateTx(tx);
      
      // If we have a CID, update the data pointer
      if (dataCID) {
        console.log("Updating data pointer with CID:", dataCID);
        const updateTx = prepareContractCall({
          contract: inheritanceSwitch,
          method: "updateDataPointer",
          params: [dataCID],
        });
        await sendCreateTx(updateTx);
      }
      
      alert("Switch created successfully!");
      router.push(`/status/${account.address}`);
    } catch (error) {
      console.error("Switch creation failed:", error);
      alert("Switch creation failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col items-center pt-10 px-4">
        <div className="w-full max-w-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-3xl font-bold mb-6">Create a New Inheritance Switch</h1>

          <Card>
            <CardHeader>
              <CardTitle>Switch Details</CardTitle>
              <CardDescription>
                Define who inherits, how much, and the check-in frequency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-6">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="beneficiary">Beneficiary's Wallet Address</Label>
                  <Input
                    id="beneficiary"
                    placeholder="0x..."
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    disabled={!isConnected || isApproving || isCreating}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="amount">Amount to Lock</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00 $PYUSD"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!isConnected || isApproving || isCreating}
                  />
                  {isConnected && (
                    <p className="text-sm text-muted-foreground pt-1">
                      Your available PYUSD balance: {displayBalance} PYUSD
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="timeout">Timeout Period (Days)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="180"
                    value={timeoutPeriod}
                    onChange={(e) => setTimeoutPeriod(e.target.value)}
                    disabled={!isConnected || isApproving || isCreating}
                  />
                  <p className="text-sm text-muted-foreground pt-1">
                    After this many days without check-in, your beneficiary can claim the assets.
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="will">Inheritance Message (Optional)</Label>
                  <textarea
                    id="will"
                    placeholder="Write a message or will for your beneficiary..."
                    value={willMessage}
                    onChange={(e) => setWillMessage(e.target.value)}
                    disabled={!isConnected || isApproving || isCreating}
                    className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-sm text-muted-foreground">
                    This message will be stored securely on IPFS and only accessible to your beneficiary.
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Check-in Required</AlertTitle>
                  <AlertDescription>
                    You must check in within the timeout period you specify. If you don't, your beneficiary can claim the assets.
                  </AlertDescription>
                </Alert>

                {/* Show error if user already has an active switch */}
                {mySwitchDetails?.isActive && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Switch Already Active</AlertTitle>
                    <AlertDescription>
                      You already have an active inheritance switch. Redirecting to status page...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Show insufficient balance warning */}
                {isConnected && amount && balanceData && (
                  (() => {
                    const amountInWei = toUnits(amount, 6);
                    const hasInsufficientBalance = balanceData < amountInWei;
                    return hasInsufficientBalance ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Insufficient Balance</AlertTitle>
                        <AlertDescription>
                          You don't have enough PYUSD tokens. You need {amount} PYUSD but only have {displayBalance} PYUSD.
                        </AlertDescription>
                      </Alert>
                    ) : null;
                  })()
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full space-x-4">
                {isConnected ? (
                  <>
                    {!isApproved ? (
                      <Button
                        onClick={handleApprove}
                        className="flex-1"
                        disabled={isApproving || isCreating || !beneficiary || !amount || !timeoutPeriod || isLoadingBalance || isLoadingAllowance}
                      >
                        {isApproving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isApproving ? "Approving..." : "Approve PYUSD Transfer"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCreateSwitch}
                        className="flex-1"
                        disabled={isApproving || isCreating || !beneficiary || !amount || !timeoutPeriod || isLoadingBalance || isLoadingAllowance}
                      >
                        {isCreating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isCreating ? "Creating..." : "Create Switch"}
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground w-full text-center">
                    Please connect your wallet to proceed.
                  </p>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <footer className="py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Built for the hackathon.
        </p>
      </footer>
    </div>
  );
}