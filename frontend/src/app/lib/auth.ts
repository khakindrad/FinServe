export function getToken(){ return localStorage.getItem('token'); }
export function setToken(t:string){ localStorage.setItem('token', t); }
export function clearToken(){ localStorage.removeItem('token'); }

export async function refreshToken(refreshToken:string){
  const res = await fetch('/api/proxy/auth/refresh', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ refreshToken })});
  if(res.ok) return await res.json();
  return null;
}
