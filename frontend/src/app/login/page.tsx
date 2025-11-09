'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e: any) {
    e.preventDefault();
    const res = await fetch('/api/proxy/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setMsg('Logged in (demo)');
    } else setMsg('Login failed');
  }

  return (
    <>
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f7f9fb, #e3ebf6);
          font-family: Inter, system-ui, sans-serif;
        }

        .login-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        h2 {
          color: #0d1b2a;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }

        form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        input {
          width: 90%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          margin: 0 auto;
        }

        input:focus {
          border-color: #0077ff;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 119, 255, 0.2);
        }

        button {
          width: 100%;
          background-color: #0077ff;
          color: #fff;
          border: none;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background-color: #005ecc;
        }

        .extras {
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .extras a {
          color: #0077ff;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .extras a:hover {
          color: #005ecc;
        }

        .register-text {
          margin-top: 1.5rem;
          font-size: 0.95rem;
          text-align: center;
        }

        .register-text a {
          color: #0077ff;
          text-decoration: none;
          font-weight: 600;
        }

        .register-text a:hover {
          color: #005ecc;
        }

        .message {
          margin-top: 1rem;
          font-weight: 500;
          color: #0077ff;
          text-align: center;
        }

        @media (max-width: 480px) {
          .login-card {
            margin: 1rem;
            padding: 1.5rem;
          }

          h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={submit}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />

            <div className="extras">
              <Link href="/forgot">Forgot Password?</Link>
            </div>

            <button type="submit">Login</button>
          </form>

          <div className="register-text">
            Don’t have an account? <Link href="/register">Register</Link>
          </div>

          <div className="message">{msg}</div>
        </div>
      </div>
    </>
  );
}
