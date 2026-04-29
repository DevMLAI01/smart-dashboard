import { Redis } from "@upstash/redis";
import { DashboardData } from "./types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function saveDashboard(data: DashboardData): Promise<void> {
  await redis.set(`dashboard:${data.id}`, JSON.stringify(data), {
    ex: TTL_SECONDS,
  });
}

export async function getDashboard(id: string): Promise<DashboardData | null> {
  const raw = await redis.get<string>(`dashboard:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as DashboardData);
}
