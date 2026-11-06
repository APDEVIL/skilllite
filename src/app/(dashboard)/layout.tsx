// src/app/(dashboard)/layout.tsx
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/server/better-auth/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <DashboardShell>{children}</DashboardShell>;
}