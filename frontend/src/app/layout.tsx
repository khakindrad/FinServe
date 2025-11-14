import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import  Navbar  from "@/components/layout/Navbar";
import  Footer  from "@/components/layout/Footer";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Header */}
          <Navbar />
          {children}
          {/* Footer */}
          <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}
