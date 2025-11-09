'use client';

import Link from 'next/link';
import Notifications from '../components/Notifications';

export default function Home() {
  return (
    <>
      <style jsx>{`
        .container {
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          background: linear-gradient(135deg, #f5f8ff, #e9eef7);
          color: #1a2b4b;
          display: flex;
          flex-direction: column;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #ffffffcc;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .brand strong {
          font-size: 1.4rem;
          color: #0052cc;
          letter-spacing: 0.5px;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .login-btn {
          padding: 0.6rem 1.2rem;
          background-color: #0052cc;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          background-color: #003d99;
          transform: translateY(-2px);
        }

        section.hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 5rem 2rem;
        }

        h1 {
          font-size: 2.75rem;
          font-weight: 700;
          color: #0d1b2a;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        p {
          font-size: 1.15rem;
          max-width: 620px;
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 2.2rem;
        }

        .cta-btn {
          padding: 0.9rem 1.8rem;
          background-color: #0077ff;
          color: #fff;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(0, 119, 255, 0.25);
          transition: all 0.3s ease;
        }

        .cta-btn:hover {
          background-color: #005ecc;
          transform: translateY(-2px);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
          padding: 4rem 2rem;
          background: #ffffff;
        }

        .feature {
          background: #f9fbfd;
          padding: 2rem 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease;
        }

        .feature:hover {
          transform: translateY(-5px);
        }

        .feature img {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
        }

        .feature h3 {
          font-size: 1.25rem;
          color: #0d1b2a;
          margin-bottom: 0.5rem;
        }

        .feature p {
          font-size: 0.95rem;
          color: #4b5563;
          line-height: 1.6;
        }

        footer {
          text-align: center;
          padding: 1.5rem;
          background: #ffffff;
          border-top: 1px solid #eaeaea;
          color: #6b7280;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }

          p {
            font-size: 1rem;
          }

          .cta-btn {
            padding: 0.8rem 1.5rem;
          }
        }
      `}</style>

      <main className="container">
        {/* Hero Section */}
        <section className="hero">
          <h1>Empowering Your Financial Journey</h1>
          <p>
            Manage loans, monitor investments, and gain insights with FinServe — your secure and
            intelligent financial companion.
          </p>
          <Link href="/register" className="cta-btn">
            Get Started
          </Link>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="feature">
            <img src="https://img.icons8.com/color/48/money-bag.png" alt="Loans" />
            <h3>Loan Management</h3>
            <p>Easily track, manage, and repay your loans with complete transparency.</p>
          </div>

          <div className="feature">
            <img src="https://img.icons8.com/color/48/combo-chart.png" alt="Insights" />
            <h3>Smart Insights</h3>
            <p>Access personalized financial analytics to make data-driven decisions.</p>
          </div>

          <div className="feature">
            <img src="https://img.icons8.com/color/48/security-checked.png" alt="Security" />
            <h3>Bank-Grade Security</h3>
            <p>Your data is encrypted and secured using enterprise-grade protocols.</p>
          </div>
        </section>

        {/* Footer */}
        <footer>© {new Date().getFullYear()} FinServe. All rights reserved.</footer>
      </main>
    </>
  );
}
