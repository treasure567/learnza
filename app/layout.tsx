import "./global.css";
import Providers from "./providers";
import localFont from "next/font/local";
import { Montserrat, Inter } from "next/font/google";
import { Syne } from "next/font/google";
import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { WagmiProvider } from "../components/shared/WagmiProvider";  

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

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: "#2A9D8F",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://learnza.xyz"),
  icons: { icon: "/images/logo.png" },
  title: "Learnza - Inclusive Interactive Learning & Credential Blockchain",
  description:
    "An accessible learning platform for everyone, powered by blockchain technology. Learn, earn, and verify credentials on-chain.",
  applicationName: "Learnza Platform",
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
    title: "Learnza - Inclusive Interactive Learning & Credential Blockchain",
    siteName: "Learnza Platform",
    locale: "en_US",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Learnza Platform - Inclusive Learning for Everyone",
      },
    ],
  },
  twitter: {
    site: "@learnza",
    creator: "@learnza",
    title: "Learnza - Inclusive Interactive Learning & Credential Blockchain",
    description:
      "An accessible learning platform for everyone, powered by blockchain technology. Learn, earn, and verify credentials on-chain.",
    card: "summary_large_image",
    images: ["/images/twitter-card.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "Learnza Platform",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  abstract:
    "Learnza is a revolutionary learning platform that combines accessibility, blockchain technology, and cultural inclusivity to make education accessible to everyone.",
  category: "Education",
  classification: "Education Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${montserrat.className} ${geistMono.variable} ${syne.variable} ${inter.variable} antialiased bg-light text-text dark:bg-dark dark:text-light`}
      >
        <NextTopLoader color="#166534" height={3} showSpinner={false} />
        <WagmiProvider>
          <Providers>{children}</Providers>
        </WagmiProvider>
      </body>
    </html>
  );
}
