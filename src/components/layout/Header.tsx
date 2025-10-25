import Link from "next/link";
// Make sure you have lucide-react: npm install lucide-react
import { Package } from "lucide-react"; 
import { ConnectWalletButton } from "@/components/ConnectWallet";

export function Header() {
  return (
    <header className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Package className="h-6 w-6 text-blue-500" />
          <span className="font-semibold text-lg">
            Decentralized Inheritance Switch
          </span>
        </Link>
        
        {/* Connect Wallet Button */}
        <ConnectWalletButton />
      </div>
    </header>
  );
}