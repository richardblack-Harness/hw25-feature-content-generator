import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-black">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <img
              src="/harness.svg"
              alt="Harness logo"
              width={100}
              height={100}
              className="text-blue-500"
            />
            <span className="hidden md:flex items-center space-x-6"></span>
          </Link>
          <Link href="/" className="text-sm hover:text-blue-400">
            Feature Form
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/templates" className="text-sm hover:text-blue-400">
              Templates
            </Link>
            <Link href="/submissions" className="text-sm hover:text-blue-400">
              Submissions
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
