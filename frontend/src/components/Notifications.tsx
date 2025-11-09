'use client'
import { useEffect, useState } from 'react';

type Alert = { id:number, title:string, message:string, isRead:boolean, createdAt:string };

export default function Notifications(){
  const [alerts,setAlerts] = useState<Alert[]>([]);
  const [msg,setMsg] = useState('');

  useEffect(()=>{ load(); },[]);

  async function load(){
    const token = localStorage.getItem('token');
    const res = await fetch('/api/proxy/alerts/my', { headers: { 'authorization': token ? `Bearer ${token}` : '' } });
    if(res.ok){
      const data = await res.json();
      setAlerts(data);
    } else setMsg('Unable to load alerts');
  }

  async function markRead(id:number){
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/proxy/alerts/markread/${id}`, { method:'PUT', headers: { 'authorization': token ? `Bearer ${token}` : '' } });
    if(res.ok) load();
  }

  return (
    <div style={{maxWidth:480}}>
      <h4>Notifications</h4>
      {msg && <div>{msg}</div>}
      <ul>
        {alerts.map(a => (
          <li key={a.id} style={{marginBottom:8,background:a.isRead? '#f5f5f5':'#fff',padding:8,border:'1px solid #ddd'}}>
            <strong>{a.title}</strong><br/>
            <small>{new Date(a.createdAt).toLocaleString()}</small>
            <p>{a.message}</p>
            {!a.isRead && <button onClick={()=>markRead(a.id)}>Mark read</button>}
          </li>
        ))}
      </ul>
    </div>
  )
}
