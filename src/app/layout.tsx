import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Super Awoof – Win Big with Every Spin",
  description: "Spin the reels and win big. Join thousands of players already winning on Super Awoof.",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

// Keeps the browser's own chrome dark on iOS Safari rather than defaulting to
// a light bar below the page.
export const viewport: Viewport = {
  themeColor: "#0A0C10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
