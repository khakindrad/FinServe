import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";

export const metadata = {
  title: "FinServe",
  description: "Improved Next.js Auth Starter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
