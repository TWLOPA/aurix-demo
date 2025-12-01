import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarLayout } from "@/components/SidebarLayout";

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
          <SidebarLayout>
            {children}
          </SidebarLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
