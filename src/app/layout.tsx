'use client'
import { Toaster } from 'react-hot-toast';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><Navbar/>
        <SidebarProvider>
          <SidebarInset>
            <Toaster position="bottom-right"/>
            <AppSidebar/>
            {children}
          </SidebarInset>
        </SidebarProvider> 
      </body>
    </html>
  );
}
