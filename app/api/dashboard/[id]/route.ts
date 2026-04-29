import { NextRequest, NextResponse } from "next/server";
import { getDashboard } from "@/lib/kv";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const data = await getDashboard(id);

  if (!data) {
    return NextResponse.json(
      { error: "Dashboard not found or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
