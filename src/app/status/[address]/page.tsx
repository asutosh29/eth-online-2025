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
import { ArrowLeft } from "lucide-react";
// 1. Import 'useParams' from next/navigation
import { useRouter, useParams } from "next/navigation"; 
import { Button } from "@/components/ui/button";

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

// Mock data structure
interface MockStatus {
  isActive: boolean;
  beneficiary: string;
  lockedAmount: string;
  token: string;
  lastCheckIn: string;
  nextCheckIn: string;
}

// 2. Remove 'params' from the function props
export default function StatusPage() {
  const router = useRouter();
  const params = useParams(); // 3. Get params using the hook
  
  // Cast to string, as useParams can return string | string[]
  const ownerAddress = params.address as string; 

  const [isLoading, setIsLoading] = useState(true);
  const [mockStatus, setMockStatus] = useState<MockStatus | null>(null);

  // Simulate fetching data when the page loads
  useEffect(() => {
    setIsLoading(true);
    // Fake a 1-second network delay
    setTimeout(() => {
      // Create and set mock data
      setMockStatus({
        isActive: true,
        beneficiary: "0x...BENEFICIARY_ADDRESS",
        lockedAmount: "5,000.00",
        token: "$PYUSD",
        lastCheckIn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toLocaleDateString(), // 30 days ago
        nextCheckIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150).toLocaleDateString(), // 150 days from now
      });
      setIsLoading(false);
    }, 1000);
  }, [ownerAddress]); // Re-fetch if the address changes

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
                Showing status for owner:{" "}
                <span className="font-mono text-xs">{ownerAddress}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <StatusItem
                  title="Status"
                  value={isLoading ? "..." : (mockStatus?.isActive ? "Active" : "Inactive")}
                  isLoading={isLoading}
                />
                <StatusItem
                  title="Beneficiary"
                  value={mockStatus?.beneficiary}
                  isLoading={isLoading}
                />
                <StatusItem
                  title="Locked Amount"
                  value={isLoading ? "..." : `${mockStatus?.lockedAmount} ${mockStatus?.token}`}
                  isLoading={isLoading}
                />
                <StatusItem
                  title="Last Check-in"
                  value={mockStatus?.lastCheckIn}
                  isLoading={isLoading}
                />
                <StatusItem
                  title="Next Check-in By"
                  value={mockStatus?.nextCheckIn}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}