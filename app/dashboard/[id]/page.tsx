import { notFound } from "next/navigation";
import { getDashboard } from "@/lib/kv";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDashboard(id);

  if (!data) {
    notFound();
  }

  return <DashboardClient data={data} />;
}
