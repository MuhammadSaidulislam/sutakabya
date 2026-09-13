import type { Metadata } from "next";

import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Sutakabya | Ladies Dress & Fashion in Bangladesh",
    template: "%s | Sutakabya",
  },

  description:  "Shop stylish ladies dresses, women's fashion, three piece, salwar kameez and more at Sutakabya. Discover elegant and comfortable women's clothing online in Bangladesh.",

  keywords: [
    "Sutakabya",
    "ladies dress",
    "ladies dress Bangladesh",
    "women's dress Bangladesh",
    "women fashion Bangladesh",
    "ladies fashion",
    "women clothing",
    "three piece",
    "salwar kameez",
    "ladies three piece",
    "women's clothing online",
    "ladies dress online Bangladesh",
    "women dress online",
  ],

  authors: [{ name: "Sutakabya" }],
  creator: "Sutakabya",
  publisher: "Sutakabya",

  metadataBase: new URL("https://sutakabya.com"),

  alternates: {
    canonical: "https://sutakabya.com",
  },

  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://sutakabya.com",
    siteName: "Sutakabya",
    title: "Sutakabya | Ladies Dress & Fashion in Bangladesh",
    description:
      "Discover stylish ladies dresses, three piece, salwar kameez and women's fashion at Sutakabya. Shop women's clothing online in Bangladesh.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sutakabya | Ladies Dress & Fashion in Bangladesh",
    description:
      "Shop stylish ladies dresses, three piece, salwar kameez and women's fashion online at Sutakabya.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div>
     <AppShell>{children}</AppShell> 
    </div>
  );
}