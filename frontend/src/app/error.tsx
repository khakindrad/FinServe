"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalErrorPage({ error, reset }: any) {
  useEffect(() => {
    console.error("APP ERROR:", error);
  }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      
      <div className="bg-white p-10 rounded-2xl shadow-lg border max-w-lg">
        
        <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. You can try again or go back to the homepage.
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="outline">
            Try Again
          </Button>

          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
       FinServe Portal
      </p>
    </div>
  );
}
