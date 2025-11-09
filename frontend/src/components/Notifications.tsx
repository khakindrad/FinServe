'use client';
import { useEffect, useState } from 'react';

type Alert = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function Notifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/proxy/alerts/my', {
        headers: { authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
        setMsg('');
      } else setMsg('Unable to load alerts');
    } catch (err) {
      console.error(err);
      setMsg('Error connecting to server');
    }
  }

  async function markRead(id: number) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/proxy/alerts/markread/${id}`, {
      method: 'PUT',
      headers: { authorization: token ? `Bearer ${token}` : '' },
    });
    if (res.ok) load();
  }

  return (
    <>
      <style jsx>{`
        .notif-container {
          position: relative;
          cursor: pointer;
        }

        .notif-list {
          position: absolute;
          right: 0;
          top: 120%;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          padding: 0.75rem;
          z-index: 20;
        }

        .notif-item {
          background: #f9fbff;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          transition: background-color 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .notif-item:hover {
          background-color: #eef5ff;
        }

        .notif-item.read {
          background-color: #f5f5f5;
          color: #777;
        }

        .notif-title {
          font-weight: 600;
          color: #1a2b4b;
        }

        .notif-date {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .notif-msg {
          margin: 0.25rem 0;
          color: #334155;
        }

        button {
          background-color: #0077ff;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 0.3rem 0.6rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        button:hover {
          background-color: #005ecc;
        }

        .badge {
          position: absolute;
          top: -4px;
          right: -6px;
          background: #ff3b30;
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          border-radius: 50%;
          padding: 2px 6px;
        }

        .bell {
          font-size: 1.5rem;
          color: #0052cc;
          transition: transform 0.2s ease;
        }

        .bell:hover {
          transform: scale(1.1);
        }
      `}</style>

      <div className="notif-container">
        {/* Notification Icon */}
        <span className="bell">🔔</span>
        {alerts.some((a) => !a.isRead) && (
          <span className="badge">{alerts.filter((a) => !a.isRead).length}</span>
        )}

        {/* Notification List */}
        {alerts.length > 0 && (
          <div className="notif-list">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`notif-item ${a.isRead ? 'read' : ''}`}
              >
                <div className="notif-title">{a.title}</div>
                <div className="notif-date">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
                <p className="notif-msg">{a.message}</p>
                {!a.isRead && (
                  <button onClick={() => markRead(a.id)}>Mark as read</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message if API fails */}
        {msg && <div style={{ color: 'red', fontSize: '0.85rem' }}>{msg}</div>}
      </div>
    </>
  );
}
  