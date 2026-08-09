import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { LayoutContent } from "@/components/LayoutContent";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "E-Barber - Executive Barber Lounge & POS System",
  description: "Barbershop POS, Walk-in Management, Barber Performance & Daily Closing System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body className={`${sora.className} bg-slate-100 text-slate-900 antialiased min-h-screen`} suppressHydrationWarning>
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
      </body>
    </html>
  );
}
