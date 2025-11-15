"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, BarChart3, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-20 py-24 gap-16">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Take Control of Your<br />
            <span className="text-blue-600">Financial Future</span>.
          </h2>

          <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-xl mx-auto md:mx-0">
            Track your transactions, manage investments, analyze insights,
            and grow your wealth using a unified and secure financial dashboard.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <Link href="/register">
              <Button size="lg" className="flex items-center gap-2 px-8 py-6 text-lg">
                Get Started <ArrowRight size={20} />
              </Button>
            </Link>

            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/data-analysis-3d-illustration-10242833-8250911.png?f=webp"
            alt="Finance Illustration"
            className="w-80 md:w-[30rem] drop-shadow-xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 md:px-20 py-20 bg-white border-t">
        <h3 className="text-3xl md:text-4xl font-semibold text-center mb-16">
          Why Choose <span className="text-blue-600">FinServe?</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Feature 1 */}
          <div className="p-8 bg-gray-50 rounded-2xl shadow-sm border hover:shadow-lg transition">
            <ShieldCheck className="h-12 w-12 text-blue-600 mb-4" />
            <h4 className="font-semibold text-xl mb-3">Bank-Grade Security</h4>
            <p className="text-gray-600">
              Your data is encrypted and stored securely using industry-leading standards.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 bg-gray-50 rounded-2xl shadow-sm border hover:shadow-lg transition">
            <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
            <h4 className="font-semibold text-xl mb-3">Real-Time Insights</h4>
            <p className="text-gray-600">
              Visual dashboards and instant analytics help you make smarter financial decisions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 bg-gray-50 rounded-2xl shadow-sm border hover:shadow-lg transition">
            <Layers className="h-12 w-12 text-blue-600 mb-4" />
            <h4 className="font-semibold text-xl mb-3">Unified Platform</h4>
            <p className="text-gray-600">
              Manage accounts, investments, transactions & reports — all in one simple interface.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
