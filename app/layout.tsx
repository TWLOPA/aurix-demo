import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarLayout } from "@/components/SidebarLayout";
import { SidebarProvider } from "@/lib/sidebar-context";
import { Analytics } from "@vercel/analytics/react";

// Use Inter as per ElevenLabs design tokens
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AURIX - Agent Simulation",
  description: "Real-time Voice AI Agent Execution Environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <SidebarProvider>
            <SidebarLayout>
              {children}
            </SidebarLayout>
          </SidebarProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
