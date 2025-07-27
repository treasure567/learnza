import "./global.css";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import { AOS } from "./components/global";
import { Montserrat } from "next/font/google";
import type { Metadata, Viewport } from "next";

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

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: "#2A9D8F",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://learnza.xyz"),
  icons: {
    icon: "/images/logo.svg",
  },
  title: "IILCB - Inclusive Interactive Learning & Credential Blockchain",
  description:
    "An accessible learning platform for everyone, powered by blockchain technology. Learn, earn, and verify credentials on-chain.",
  applicationName: "IILCB Platform",
  authors: [{ name: "Learnza Team", url: "https://learnza.xyz" }],
  keywords: [
    "Education",
    "Blockchain",
    "Accessibility",
    "Learning",
    "Credentials",
    "Web3",
    "Inclusive Learning",
    "Sign Language",
    "Voice Learning",
    "Cultural Education",
    "Learn to Earn",
  ],
  creator: "Learnza Team",
  publisher: "Learnza",
  generator: "Next.js",
  referrer: "origin",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://learnza.xyz",
    title: "IILCB - Inclusive Interactive Learning & Credential Blockchain",
    siteName: "IILCB Platform",
    locale: "en_US",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "IILCB Platform - Inclusive Learning for Everyone",
      },
    ],
  },
  twitter: {
    site: "@learnza",
    creator: "@learnza",
    title: "IILCB - Inclusive Interactive Learning & Credential Blockchain",
    description:
      "An accessible learning platform for everyone, powered by blockchain technology. Learn, earn, and verify credentials on-chain.",
    card: "summary_large_image",
    images: ["/images/twitter-card.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "IILCB Platform",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  abstract:
    "IILCB is a revolutionary learning platform that combines accessibility, blockchain technology, and cultural inclusivity to make education accessible to everyone.",
  category: "Education",
  classification: "Education Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${montserrat.className} ${geistMono.variable} antialiased bg-light text-text`}
      >
        <Toaster richColors />
        <AOS />
        {children}
      </body>
    </html>
  );
}
