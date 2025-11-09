'use client';

import Link from 'next/link';
// import Notifications from './Notifications';

export default function Navbar() {
  return (
    <>
      <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #ffffffcc;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        a {
          text-decoration: none;
          font-weight: 500;
          color: #0d1b2a;
          transition: color 0.2s;
        }

        a:hover {
          color: #0077ff;
        }

        .btn {
          background: #0077ff;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .btn:hover {
          background: #005ecc;
        }
      `}</style>

      <nav>
        <div className="brand">
          <img
            src="https://img.icons8.com/color/48/000000/bank-building.png"
            alt="FinServe"
            style={{ width: 32, height: 32 }}
          />
          <strong>FinServe</strong>
        </div>

        <div className="actions">
          {/* <Notifications /> */}
          <Link href="/">Home</Link>
          <Link href="/login" className="btn">Login</Link>
        </div>
      </nav>
    </>
  );
}
