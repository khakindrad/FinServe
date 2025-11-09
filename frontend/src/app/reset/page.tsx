'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Reset({ params }: { params: { token: string } }) {
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');
  const router = useRouter();

  async function submit(e:any){
    e.preventDefault();
    const res = await fetch('/api/proxy/auth/reset-password', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ token: params.token, newPassword: password })
    });
    if(res.ok){ setMsg('Password reset successful'); router.push('/login'); }
    else setMsg('Reset failed');
  }

  return (
    <main style={{padding:24}}>
      <h2>Reset Password</h2>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:10,width:360}}>
        <input placeholder='New password' value={password} onChange={e=>setPassword(e.target.value)} type='password' required/>
        <button type='submit'>Reset</button>
      </form>
      <div>{msg}</div>
    </main>
  );
}
