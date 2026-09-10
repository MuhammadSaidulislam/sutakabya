"use client";
// import "../../admin/admin.css";

import AppShell from "@/components/AppShell";

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