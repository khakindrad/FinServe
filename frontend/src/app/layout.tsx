// import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'FinServe Portal',
  description: 'Financial Service Portal - Manage loans and access insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Common Navbar for all pages */}
        <Navbar />
        
        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}
