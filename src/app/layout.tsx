import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { ToastProvider } from "@/context/ToastContext";
import { AttributionCapture } from "@/components/AttributionCapture";

const SITE_URL = "https://www.superawoof.ng";
const TITLE = "Super Awoof – Win Big with Every Spin";
const DESCRIPTION =
  "Spin the reels and win big. Subscribe on MTN, get coins every cycle, and cash out straight to your bank.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Super Awoof",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  // Without these a link shared on WhatsApp -- which is how this audience
  // shares everything -- renders as bare text with no title and no image.
  openGraph: {
    type: "website",
    siteName: "Super Awoof",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_NG",
    images: [
      {
        url: "/images/favicon.png",
        width: 512,
        height: 512,
        alt: "Super Awoof",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/favicon.png"],
  },
};

// Keeps the browser's own chrome dark on iOS Safari rather than defaulting to
// a light bar below the page.
export const viewport: Viewport = {
  themeColor: "#0A0C10",
  colorScheme: "dark",
  // Lets the page reach under the notch and home indicator, which is what
  // makes env(safe-area-inset-*) report real values.
  viewportFit: "cover",
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
        <AttributionCapture />
        <ToastProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
