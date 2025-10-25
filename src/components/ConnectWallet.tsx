"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client"; // Import our client
import { buttonVariants } from "@/components/ui/button";
import { defineChain } from "thirdweb/chains";

// !!! DEFINE YOUR CHAIN HERE !!!
// Example: Sepolia
const chain = defineChain(11155111); 

export function ConnectWalletButton() {
  return (
    <ConnectButton
      client={client}
      chain={chain} // Specify the chain you want users to connect to
      theme={"dark"}
      connectButton={{
        // Use ShadCN's button variant class to style it
        className: buttonVariants({ variant: "default" }),
      }}
      connectModal={{
        size: "compact",
      }}
    />
  );
}