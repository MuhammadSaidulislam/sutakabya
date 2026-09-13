import type { Metadata } from "next";
import { cookies } from "next/headers";

import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import TopBar from "@/components/Header/TopBar";
import NavBar from "@/components/Header/NavBar";

import { getCategories } from "@/lib/categories";

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

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const token = cookieStore.get("user_token")?.value;
  const isLoggedIn = Boolean(token);

  const categories = await getCategories();

  return (
    <>
      <TopBar />

      <NavBar  isLoggedIn={isLoggedIn} categories={categories} />

      <CartDrawer isLoggedIn={isLoggedIn} />

      {children}

      <Footer categories={categories} />
    </>
  );
}