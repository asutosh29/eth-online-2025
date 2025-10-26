"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client"; // Import our client
import { buttonVariants } from "@/components/ui/button";
import { sepoliaChain } from "@/lib/chains"; 

export function ConnectWalletButton() {
  return (
    <ConnectButton
      client={client}
      chain={sepoliaChain}
      theme={"dark"}
      connectButton={{
        className: buttonVariants({ variant: "default" }),
      }}
      connectModal={{
        size: "compact",
      }}
    />
  );
}