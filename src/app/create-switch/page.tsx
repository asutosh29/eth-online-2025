"use client";

import { useState } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateSwitchPage() {
  const router = useRouter();
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Mock: In a real app, this would come from your wallet connection
  const isConnected = true; 
  const mockBalance = "10,000.00 $PYUSD";

  // Mock function to simulate "Approve" transaction
  const handleApprove = () => {
    if (!beneficiary || !amount) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Mock Approve:", { beneficiary, amount });
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      alert("Mock Approval Successful!");
    }, 1500); // Simulate network delay
  };

  // Mock function to simulate "Create Switch" transaction
  const handleCreateSwitch = () => {
    if (!beneficiary || !amount) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Mock Create Switch:", { beneficiary, amount });
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      alert("Mock Switch Created Successfully!");
      // Redirect to a mock status page
      router.push(`/status/0x...YOUR-MOCK-ADDRESS`);
    }, 1500); // Simulate network delay
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
                      Your available $PYUSD balance: {mockBalance}
                    </p>
                  )}
                </div>

                <Alert>
                  {/* <InfoCircledIcon className="h-4 w-4" /> */}
                  <AlertTitle>Fixed Check-in</AlertTitle>
                  <AlertDescription>
                    Check-in required every 6 months (fixed).
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full space-x-4">
                {isConnected ? (
                  <>
                    <Button
                      onClick={handleApprove}
                      className="flex-1"
                      disabled={isApproving || isCreating || !beneficiary || !amount}
                    >
                      {isApproving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isApproving ? "Approving..." : "Approve $PYUSD Transfer"}
                    </Button>

                    <Button
                      onClick={handleCreateSwitch}
                      className="flex-1"
                      disabled={isApproving || isCreating || !beneficiary || !amount}
                    >
                      {isCreating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isCreating ? "Creating..." : "Create Switch"}
                    </Button>
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