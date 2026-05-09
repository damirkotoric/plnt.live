import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://plnt.live"),
  title: {
    default: "plnt.live — live earthquake map",
    template: "%s | plnt.live",
  },
  description:
    "A living atlas of planet Earth. Real-time earthquake activity, beautifully rendered.",
  openGraph: {
    siteName: "plnt.live",
    type: "website",
    url: "https://plnt.live",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <Script
          defer
          data-domain="plnt.live"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
