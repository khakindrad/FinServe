import Link from 'next/link';

export default function Home() {
  return (
    <main style={{padding:24}}>
      <nav style={{display:'flex',gap:12,alignItems:'center'}}>
        <strong>FinServe</strong>
		<Notifications/>
        <Link href='/login'>Login</Link>
      </nav>
      <h1>Welcome to FinServe Portal</h1>
      <p>This is a starter Next.js frontend. Implement UI and API integration as needed.</p>
    </main>
  )
}
