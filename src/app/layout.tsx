import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI Focus Planner",
  description: "Manage your areas, intentions, and chunks effectively",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ConvexClientProvider>
          {children}
          <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
