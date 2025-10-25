"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header"; 

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const router = useRouter();

  const handleCheckStatus = () => {
    if (walletAddress) {
      router.push(`/status/${walletAddress}`);
    } else {
      alert("Please enter a wallet address.");
    }
  };

  const handleCreateSwitch = () => {
    router.push("/create-switch"); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col justify-center items-center text-center px-4">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Manage Your Digital Legacy
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Securely create a new inheritance switch or check the status of an
            existing one. Our decentralized platform ensures your assets are
            passed on according to your wishes, without intermediaries.
          </p>
          <Button size="lg" onClick={handleCreateSwitch}>
            Create a New Switch
          </Button>
        </div>

        {/* Separator and "Check Status" Section */}
        <div className="mt-16 w-full max-w-md">
          <div className="flex items-center justify-center mb-4">
            <span className="text-sm text-muted-foreground">or</span>
          </div>
          
          <h3 className="text-lg font-medium mb-3">
            Check the Status of an Existing Switch
          </h3>
          
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter owner's wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <Button variant="secondary" onClick={handleCheckStatus}>
              Check...
            </Button>
          </div>
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