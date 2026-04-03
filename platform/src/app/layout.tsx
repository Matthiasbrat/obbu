import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { ThemeProvider } from "@/components/layout/ThemeContext";
import { PluginProvider } from "@/lib/plugins/context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Obbu — Observability Platform",
  description: "Business-to-technical observability with three-layer RCA correlation",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex bg-background text-foreground">
        <ThemeProvider>
          <PluginProvider>
            <SidebarProvider>
              <Sidebar />
              <main className="flex-1 lg:ml-64 min-h-screen">
                {children}
              </main>
            </SidebarProvider>
          </PluginProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
