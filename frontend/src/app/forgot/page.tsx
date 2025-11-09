'use client'
import { useState } from 'react';

export default function Forgot() {
  const [email,setEmail]=useState('');
  const [msg,setMsg]=useState('');

  async function submit(e:any){
    e.preventDefault();
    const res = await fetch('/api/proxy/auth/forgot-password', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ email })
    });
    setMsg(res.ok ? 'Password reset link sent (demo)' : 'Failed to send email');
  }

  return (
    <main style={{padding:24}}>
      <h2>Forgot Password</h2>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:10,width:360}}>
        <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} type='email' required/>
        <button type='submit'>Send Reset Link</button>
      </form>
      <div>{msg}</div>
    </main>
  );
}
