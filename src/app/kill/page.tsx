"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { 
  useReadContract, 
  useSendTransaction, 
  useActiveAccount 
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getContracts } from "@/lib/contracts";

export default function KillPage() {
  const router = useRouter();
  
  // Get connected account and contract instances
  const account = useActiveAccount();
  const { inheritanceSwitch } = getContracts();

  // Fetch user's switch details directly from the public mapping
  const { 
    data: mySwitchDetails, 
    isLoading: isLoadingSwitch,
    error: mySwitchError 
  } = useReadContract({
    contract: inheritanceSwitch,
    method: "ownerToSwitch",
    params: [account?.address || "0x0"],
    queryOptions: {
      enabled: !!account,
      retry: 0,
    },
  });

  // Transaction hooks
  const { mutate: sendCancelTx, isPending: isCancelling } = useSendTransaction();

  // Redirect if user doesn't have an active switch
  useEffect(() => {
    if (account && mySwitchDetails !== undefined && !mySwitchDetails?.isActive) {
      // User doesn't have an active switch, redirect to home
      // Only redirect after we've confirmed the account is connected and the switch is inactive
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [account, mySwitchDetails, router]);

  const isConnected = !!account;
  const hasActiveSwitch = mySwitchDetails?.isActive === true;

  // Handle cancel switch
  const handleCancelSwitch = async () => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    if (!hasActiveSwitch) {
      alert("You don't have an active switch to cancel");
      return;
    }

    try {
      const tx = prepareContractCall({
        contract: inheritanceSwitch,
        method: "cancelSwitch",
        params: [],
      });

      await sendCancelTx(tx);
      alert("Switch cancelled successfully! Your PYUSD has been returned to your wallet.");
      router.push("/");
    } catch (error) {
      console.error("Cancel switch failed:", error);
      alert("Failed to cancel switch. Please try again.");
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

          <h1 className="text-3xl font-bold mb-6">Cancel Your Inheritance Switch</h1>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                This action will permanently cancel your inheritance switch and return all locked PYUSD tokens to your wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Debug information */}
              {/* {process.env.NODE_ENV === 'development' && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Debug Info</AlertTitle>
                  <AlertDescription>
                    <div className="text-xs space-y-1">
                      <div>account: {account?.address || 'none'}</div>
                      <div>mySwitchDetails: {mySwitchDetails ? 'exists' : 'null'}</div>
                      <div>mySwitchError: {mySwitchError?.message || 'none'}</div>
                      <div>isLoadingSwitch: {String(isLoadingSwitch)}</div>
                      <div>hasActiveSwitch: {String(hasActiveSwitch)}</div>
                      <div>isActive: {String(mySwitchDetails?.isActive)}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )} */}

              {/* Loading State */}
              {isLoadingSwitch && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Loading...</AlertTitle>
                  <AlertDescription>
                    Checking your switch status...
                  </AlertDescription>
                </Alert>
              )}

              {/* No Wallet Connected */}
              {!isConnected && !isLoadingSwitch && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Wallet Not Connected</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet to cancel your inheritance switch.
                  </AlertDescription>
                </Alert>
              )}

              {/* No Active Switch */}
              {isConnected && !isLoadingSwitch && !hasActiveSwitch && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Active Switch</AlertTitle>
                  <AlertDescription>
                    You don't have an active inheritance switch to cancel.
                  </AlertDescription>
                </Alert>
              )}

              {/* Has Active Switch - Show Warning */}
              {hasActiveSwitch && isConnected && !isLoadingSwitch && (
                <>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Cancelling your inheritance switch will:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Return all your locked PYUSD tokens to your wallet</li>
                        <li>Permanently delete your switch from the contract</li>
                        <li>Your beneficiary will no longer be able to claim any assets</li>
                        <li>Any uploaded will message will be preserved but the switch will be inactive</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">What happens next?</h3>
                    <p className="text-sm text-muted-foreground">
                      Once you confirm this action, the contract will:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Transfer all locked PYUSD back to your wallet</li>
                      <li>• Emit a switchCancelled event</li>
                      <li>• Deactivate your switch</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {hasActiveSwitch && isConnected && !isLoadingSwitch && (
                <Button
                  onClick={handleCancelSwitch}
                  variant="destructive"
                  className="w-full"
                  disabled={isCancelling || isLoadingSwitch}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling Switch...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel My Inheritance Switch
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Go Back
              </Button>
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