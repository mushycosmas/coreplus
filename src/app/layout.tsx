import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Font import
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "CorePlus Consulting Limited",
  description: "Empowering businesses with innovative HR consulting solutions that drive growth and efficiency.",
  keywords: "HR consulting, business solutions, workforce strategies, CorePlus, business growth, efficiency",
  author: "CorePlus Consulting Limited",
  robots: "index, follow", // Allows search engines to index the page
  openGraph: {
    type: "website",
    title: "CorePlus Consulting Limited",
    description: "Empowering businesses with innovative HR consulting solutions that drive growth and efficiency.",
    url: "https://coreplus.co.ttz", // Replace with actual site URL
    site_name: "CorePlus Consulting",
    images: [
      {
        url: "/images/og-image.jpg", // Replace with your OG image URL
        width: 1200,
        height: 630,
        alt: "CorePlus Consulting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image", // Card type for Twitter sharing
    title: "CorePlus Consulting Limited",
    description: "Empowering businesses with innovative HR consulting solutions that drive growth and efficiency.",
    image: "/images/twitter-image.jpg", // Replace with your Twitter image URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
