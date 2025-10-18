import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database Management - Secure & Modern",
  description: "Modern database management with Next.js 15, Supabase, and Drizzle ORM",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

