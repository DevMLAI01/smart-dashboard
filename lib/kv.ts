import { Redis } from "@upstash/redis";
import { DashboardData } from "./types";

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are not set"
      );
    }
    _redis = new Redis({ url, token });
  }
  return _redis;
}

export async function saveDashboard(data: DashboardData): Promise<void> {
  await getRedis().set(`dashboard:${data.id}`, JSON.stringify(data), {
    ex: TTL_SECONDS,
  });
}

export async function getDashboard(id: string): Promise<DashboardData | null> {
  const raw = await getRedis().get<string>(`dashboard:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as DashboardData);
}
