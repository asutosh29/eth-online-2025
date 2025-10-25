"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <div className="flex justify-center mb-20">
          <Button variant={"outline"}>Click me</Button>
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Example App",
              url: "https://example.com",
            }}
          />
        </div>
      </div>
    </main>
  );
}




