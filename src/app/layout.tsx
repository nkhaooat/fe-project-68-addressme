import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import TopMenu from "@/components/TopMenu";
import ChatWidget from "@/components/ChatWidget";
import { ToastProvider } from "@/components/ToastContext";
import Footer from "@/components/Footer";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dungeon Inn | Massage Reservation",
  description: "A dark, atmospheric massage reservation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable} antialiased bg-dungeon-canvas text-dungeon-primary flex flex-col min-h-screen`}>
        <ReduxProvider>
          <ToastProvider>
            <TopMenu />
            {children}
            <ChatWidget />
            <Footer />
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}