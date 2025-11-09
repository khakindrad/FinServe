'use client'
import { useEffect, useState } from 'react';

type PendingUser = { id:number, email:string, fullName:string, role?:string };

export default function AdminDashboard(){
  const [items,setItems]=useState<PendingUser[]>([]);
  const [msg,setMsg]=useState('');

  useEffect(()=>{ load(); },[]);

  async function load(){
    const token = localStorage.getItem('token');
    const res = await fetch('/api/proxy/admin/pending-users', { headers: { 'authorization': token ? `Bearer ${token}` : '' } });
    if(res.ok){
      const data = await res.json();
      setItems(data);
    } else setMsg('Failed to load pending users or unauthorized');
  }

  async function assign(userId:number, roleId:number){
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/proxy/admin/assign-role/${userId}/${roleId}`, { method:'PUT', headers: { 'authorization': token ? `Bearer ${token}` : '' } });
    if(res.ok){
      setMsg('Role assigned');
      load();
    } else setMsg('Failed to assign role');
  }

  async function approve(userId:number){
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/proxy/auth/admin/approve/${userId}`, { method:'PUT', headers: { 'authorization': token ? `Bearer ${token}` : '' } });
    if(res.ok){ setMsg('Approved'); load(); } else setMsg('Failed');
  }

  return (
    <main style={{padding:24}}>
      <h2>Admin Dashboard - Pending Users</h2>
      <div>{msg}</div>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.email}</td><td>{u.fullName}</td>
            <td>
              <button onClick={()=>approve(u.id)}>Approve</button>
              <button onClick={()=>assign(u.id,2)}>Set Employee</button>
              <button onClick={()=>assign(u.id,3)}>Set Dealer</button>
              <button onClick={()=>assign(u.id,4)}>Set Banker</button>
              <button onClick={()=>assign(u.id,5)}>Set Customer</button>
            </td></tr>)}
        </tbody>
      </table>
    </main>
  )
}
