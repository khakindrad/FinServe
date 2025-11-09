'use client'
import { useState } from 'react';

export default function Login() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');

  async function submit(e:any){
    e.preventDefault();
    const res = await fetch('/api/proxy/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});
    if(res.ok){ setMsg('Logged in (demo)'); }
    else setMsg('Login failed');
  }

  return (
    <main style={{padding:24}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder='email' value={email} onChange={e=>setEmail(e.target.value)} /><br/>
        <input placeholder='password' value={password} onChange={e=>setPassword(e.target.value)} type='password' /><br/>
        <button type='submit'>Login</button>
      </form>
      <div>{msg}</div>
    </main>
  )
}
