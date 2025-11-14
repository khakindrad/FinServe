'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button"; // Shadcn UI button
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-blue-50 via-blue-100 to-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 leading-tight">
          Empowering Your Financial Journey
        </h1>
        <p className="max-w-xl text-gray-600 text-lg sm:text-xl mb-8">
          Manage loans, monitor investments, and gain insights with FinServe — your secure and intelligent financial companion.
        </p>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Link href="/register">Get Started</Link>
        </Button>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6 sm:px-12 py-20 bg-white">
        <div className="flex flex-col items-center bg-gray-50 p-8 rounded-2xl shadow-lg hover:translate-y-[-5px] transition-transform">
          <img src="https://img.icons8.com/color/48/money-bag.png" alt="Loans" className="mb-4"/>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Loan Management</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">
            Easily track, manage, and repay your loans with complete transparency.
          </p>
        </div>

        <div className="flex flex-col items-center bg-gray-50 p-8 rounded-2xl shadow-lg hover:translate-y-[-5px] transition-transform">
          <img src="https://img.icons8.com/color/48/combo-chart.png" alt="Insights" className="mb-4"/>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Smart Insights</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">
            Access personalized financial analytics to make data-driven decisions.
          </p>
        </div>

        <div className="flex flex-col items-center bg-gray-50 p-8 rounded-2xl shadow-lg hover:translate-y-[-5px] transition-transform">
          <img src="https://img.icons8.com/color/48/security-checked.png" alt="Security" className="mb-4"/>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Bank-Grade Security</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base">
            Your data is encrypted and secured using enterprise-grade protocols.
          </p>
        </div>
      </section>


    </main>
  );
}
