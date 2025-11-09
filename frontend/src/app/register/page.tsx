'use client'
import { useState } from 'react';

export default function Register() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [fullName,setFullName]=useState('');
  const [mobile,setMobile]=useState('');
  const [msg,setMsg]=useState('');

  async function submit(e:any){
    e.preventDefault();
    const res = await fetch('/api/proxy/auth/register', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ email, password, fullName, mobile })
    });
    const data = await res.json();
    if(res.ok) setMsg('Registered. Check email for verification and wait admin approval.');
    else setMsg(data?.message || 'Registration failed');
  }

  return (
    <main style={{padding:24}}>
      <h2>Register</h2>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:10,width:360}}>
        <input placeholder='Full name' value={fullName} onChange={e=>setFullName(e.target.value)} required/>
        <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} type='email' required/>
        <input placeholder='Mobile' value={mobile} onChange={e=>setMobile(e.target.value)} />
        <input placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} type='password' required/>
        <button type='submit'>Register</button>
      </form>
      <div>{msg}</div>
    </main>
  )
}
