'use client'
import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/app/store/sidebarStore";


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
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><Navbar/>
        <SidebarProvider>
          <SidebarInset>
            
            <Toaster position="bottom-right"/>
            <AppSidebar/>
            <div
              
            >
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider> 
      </body>
    </html>
  );
}
