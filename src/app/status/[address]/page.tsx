"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useRouter, useParams } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  useReadContract, 
  useSendTransaction, 
  useActiveAccount 
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { getContracts } from "@/lib/contracts";

// Simple utility function to format units
const formatUnits = (value: bigint, decimals: number): string => {
  const divisor = BigInt(Math.pow(10, decimals));
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const formattedFractional = fractionalStr.slice(0, 2);
  
  return `${wholePart}.${formattedFractional}`;
};

// A single item in the status card
function StatusItem({
  title,
  value,
  isLoading,
}: {
  title: string;
  value?: string | number | boolean;
  isLoading: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b last:border-b-0">
      <span className="text-muted-foreground">{title}</span>
      {isLoading ? (
        <Skeleton className="h-5 w-48" />
      ) : (
        <span className="font-mono text-sm">{String(value)}</span>
      )}
    </div>
  );
}

// Real data structure from contract
interface SwitchData {
  beneficiary: string;
  pyusdAmount: bigint;
  lastCheckIn: bigint;
  dataCID: string;
  isClaimed: boolean;
  isActive: boolean;
  timeOutPeriod: bigint;
}

export default function StatusPage() {
  const router = useRouter();
  const params = useParams();
  const account = useActiveAccount();
  
  // Cast to string, as useParams can return string | string[]
  const ownerAddress = params.address as string; 

  // Get contract instances
  const { inheritanceSwitch, pyusd } = getContracts();

  // Determine relationship FIRST (before making contract calls)
  const isOwner = account?.address?.toLowerCase() === ownerAddress?.toLowerCase();
  
  // Fetch public switch data with error handling
  // Only call if connected - let the contract enforce access
  const { 
    data: switchAmount, 
    isLoading: isLoadingAmount,
    error: amountError 
  } = useReadContract({
    contract: inheritanceSwitch,
    method: "getSwitchAmount",
    params: [ownerAddress],
    queryOptions: {
      retry: 0,
      enabled: !!account && isOwner, // Only call if connected as owner or beneficiary would get it
    },
  });

  const { 
    data: dataCID, 
    isLoading: isLoadingCID,
    error: cidError 
  } = useReadContract({
    contract: inheritanceSwitch,
    method: "getSwitchDataCID",
    params: [ownerAddress],
    queryOptions: {
      retry: 0,
      enabled: !!account && isOwner, // Only call if connected as owner or beneficiary would get it
    },
  });

  // Fetch claimable status (public function - no require for active)
  // This is always callable and can help us determine if a switch exists
  const { 
    data: isClaimable, 
    isLoading: isLoadingClaimable,
    error: claimableError 
  } = useReadContract({
    contract: inheritanceSwitch,
    method: "isClaimable",
    params: [ownerAddress],
    queryOptions: {
      retry: 0,
    },
  });

  // Check if connected account is the beneficiary - only if we know there's a switch
  const shouldCheckBeneficiary = !!account && (!!switchAmount || !amountError);
  const { 
    data: isConnectedBeneficiary,
    isLoading: isLoadingBeneficiaryCheck,
    error: beneficiaryError 
  } = useReadContract({
    contract: inheritanceSwitch,
    method: "isBeneficiary",
    params: [ownerAddress],
    queryOptions: {
      enabled: !!account && shouldCheckBeneficiary, // Only check if we have a switch
      retry: 0,
    },
  });

  // Try to get full details directly from the public mapping
  const { 
    data: mySwitchData, 
    isLoading: isLoadingMySwitch,
    error: mySwitchError 
  } = useReadContract({
    contract: inheritanceSwitch,
    method: "ownerToSwitch",
    params: [ownerAddress],
    queryOptions: {
      enabled: !!ownerAddress,
      retry: 0,
    },
  });
  
  // Determine relationship AFTER getting data
  const isBeneficiary = isConnectedBeneficiary === true;
  const isGuest = !isOwner && !isBeneficiary;

  // Use the switch data directly from the mapping
  const switchData = mySwitchData;
  const isLoadingSwitch = isLoadingMySwitch;
  // Combine all possible errors
  const switchError = amountError || cidError || claimableError || beneficiaryError;

  // Note: timeoutPeriod is stored in the Switch struct per switch, not globally
  // We'll get it from the switchData if available
  const timeoutPeriod = switchData?.timeOutPeriod || BigInt(0);

  // Transaction hooks
  const { mutate: sendTx, isPending: isCheckingIn } = useSendTransaction();
  const { mutate: sendClaimTx, isPending: isClaiming } = useSendTransaction();

  const isLoading = isLoadingAmount || isLoadingCID || isLoadingClaimable || isLoadingSwitch || isLoadingBeneficiaryCheck;
  
  // Determine if there's actually an active switch
  const hasActiveSwitch = mySwitchData?.isActive === true;

  // Handle check-in
  const handleCheckIn = async () => {
    if (!account) {
      alert("Please connect your wallet to check in");
      return;
    }
    
    try {
      const tx = prepareContractCall({
        contract: inheritanceSwitch,
        method: "checkIn",
        params: [],
      });
      
      await sendTx(tx);
      alert("Check-in successful!");
      // Data will automatically refetch due to React Query
    } catch (error) {
      console.error("Check-in failed:", error);
      alert("Check-in failed. Please try again.");
    }
  };

  // Handle claiming assets (for beneficiaries)
  const handleClaimAssets = async () => {
    if (!account) {
      alert("Please connect your wallet to claim assets");
      return;
    }
    
    try {
      const tx = prepareContractCall({
        contract: inheritanceSwitch,
        method: "claimAssets",
        params: [ownerAddress],
      });
      
      await sendClaimTx(tx);
      alert("Assets claimed successfully!");
      // Redirect to home or show success message
      router.push("/");
    } catch (error) {
      console.error("Claim failed:", error);
      alert("Claim failed. Please try again.");
    }
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: bigint) => {
    if (!timestamp) return "Never";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  // Calculate next check-in date
  const getNextCheckInDate = () => {
    if (!switchData?.lastCheckIn || !timeoutPeriod) return "Unknown";
    const nextCheckIn = Number(switchData.lastCheckIn) + Number(timeoutPeriod);
    const date = new Date(nextCheckIn * 1000);
    return date.toLocaleDateString();
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

          <Card>
            <CardHeader>
              <CardTitle>Switch Status</CardTitle>
              <CardDescription className="truncate pt-2">
                Owner: <span className="font-mono text-xs">{ownerAddress}</span>
                {account && (
                  <div className="mt-2">
                    {isOwner && (
                      <Alert className="bg-blue-500/10 border-blue-500">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">You are the owner</AlertTitle>
                      </Alert>
                    )}
                    {isBeneficiary && (
                      <Alert className="bg-green-500/10 border-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">You are the beneficiary</AlertTitle>
                      </Alert>
                    )}
                    {isGuest && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">You are viewing as a guest</AlertTitle>
                      </Alert>
                    )}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Debug information */}
              {/* {process.env.NODE_ENV === 'development' && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Debug Info</AlertTitle>
                  <AlertDescription>
                    <div className="text-xs space-y-1">
                      <div>isOwner: {String(isOwner)}</div>
                      <div>account: {account?.address || 'none'}</div>
                      <div>ownerAddress: {ownerAddress}</div>
                      <div>switchData: {switchData ? 'exists' : 'null'}</div>
                      <div>mySwitchError: {mySwitchError?.message || 'none'}</div>
                      <div>isLoadingMySwitch: {String(isLoadingMySwitch)}</div>
                      <div>hasActiveSwitch: {String(hasActiveSwitch)}</div>
                      <div>isClaimable: {String(isClaimable)}</div>
                      <div>claimableError: {claimableError?.message || 'none'}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )} */}

              {/* Show error only if we're certain there's no switch: owner viewing with no data after loading completes */}
              {!isLoading && isOwner && account && !switchData && !hasActiveSwitch && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Active Switch Found</AlertTitle>
                  <AlertDescription>
                    This address does not have an active inheritance switch. The switch may have been cancelled or never created.
                    {mySwitchError && (
                      <div className="mt-2 text-xs">
                        Error: {mySwitchError.message}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                  <StatusItem
                    title="Status"
                    value={isLoading ? "..." : (hasActiveSwitch ? "Active" : "Inactive or No Switch")}
                    isLoading={isLoading}
                  />
                  <StatusItem
                    title="Beneficiary"
                    value={
                      isOwner 
                        ? (switchData?.beneficiary || "Not set") 
                        : (isBeneficiary ? "You" : "Hidden")
                    }
                    isLoading={isLoading}
                  />
                  <StatusItem
                    title="Locked Amount"
                    value={isLoading ? "..." : (switchAmount ? `${formatUnits(switchAmount, 6)} PYUSD` : "0 PYUSD")}
                    isLoading={isLoading}
                  />
                  <StatusItem
                    title="Data CID"
                    value={hasActiveSwitch ? (dataCID || "None") : "N/A"}
                    isLoading={isLoading}
                  />
                  <StatusItem
                    title="Last Check-in"
                    value={switchData?.lastCheckIn ? formatTimestamp(switchData.lastCheckIn) : "Only visible to owner"}
                    isLoading={isLoading}
                  />
                  <StatusItem
                    title="Next Check-in By"
                    value={switchData?.lastCheckIn && timeoutPeriod ? getNextCheckInDate() : "Only visible to owner"}
                    isLoading={isLoading}
                  />
                  <StatusItem
                    title="Claimable"
                    value={isLoading ? "..." : (hasActiveSwitch ? (isClaimable ? "Yes" : "No") : "N/A")}
                    isLoading={isLoading}
                  />
                </div>
             

              {/* Action Buttons */}
              {account && hasActiveSwitch && (
                <div className="mt-6 space-y-3">
                  {account.address.toLowerCase() === ownerAddress.toLowerCase() ? (
                    // Owner actions
                    <div className="space-y-2">
                      <Button 
                        onClick={handleCheckIn}
                        disabled={isCheckingIn}
                        className="w-full"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {isCheckingIn ? "Checking In..." : "Check In"}
                      </Button>
                    </div>
                  ) : isClaimable ? (
                    // Beneficiary can claim
                    <Button 
                      onClick={handleClaimAssets}
                      disabled={isClaiming}
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isClaiming ? "Claiming..." : "Claim Assets"}
                    </Button>
                  ) : (
                    // Not claimable yet
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Not Yet Claimable</AlertTitle>
                      <AlertDescription>
                        The switch is not yet claimable. The owner needs to check in within 180 days.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Show message if no wallet connected */}
              {!account && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Wallet Not Connected</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet to interact with this switch.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}