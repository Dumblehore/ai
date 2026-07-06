import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "AetherCAT - Premium AI Mentor",
  description: "An adaptive, AI-powered mentor platform for CAT preparation, featuring spaced repetition, mistake analysis, and exam simulators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark font-sans"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
