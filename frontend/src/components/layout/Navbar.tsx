'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button"; // Shadcn UI Button

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-md px-6 sm:px-12 py-4 flex justify-between items-center">
      
      {/* Brand */}
      <div className="flex items-center gap-2">
        <img
          src="https://img.icons8.com/color/48/000000/bank-building.png"
          alt="FinServe"
          className="w-8 h-8"
        />
        <strong className="text-blue-700 text-xl sm:text-2xl font-semibold tracking-wide">
          FinServe
        </strong>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
          Home
        </Link>
        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </nav>
  );
}
