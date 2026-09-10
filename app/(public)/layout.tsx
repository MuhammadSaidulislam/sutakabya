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
  title: "MomAndChild",
  description: "MomAndChild e-commerce store",
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