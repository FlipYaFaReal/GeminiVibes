import { db } from "../db";
import { lifeItems, lifeDomainEnum } from "../db/schema";
import { eq, and, gt, lt, sql } from "drizzle-orm";

export type HealthStatus = "healthy" | "drifting" | "neglected" | "unknown";

export interface DomainHealth {
  domain: string;
  status: HealthStatus;
  lastActivity: string | null;
  itemCount: number;
  overdueCount: number;
}

const ALL_DOMAINS = lifeDomainEnum.enumValues;

/**
 * Classify health status based on the number of days since last activity.
 */
export function classifyHealth(daysSinceActivity: number | null): HealthStatus {
  if (daysSinceActivity === null) return "unknown";
  if (daysSinceActivity <= 3) return "healthy";
  if (daysSinceActivity <= 7) return "drifting";
  return "neglected";
}

/**
 * Format a date into a human-friendly relative time string.
 */
export function formatRelativeTime(date: Date | null): string | null {
  if (!date) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

/**
 * Compute domain health for all 7 life domains for a given user.
 */
export async function computeDomainHealth(userId: string): Promise<DomainHealth[]> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Fetch all items for this user that belong to a domain
  const items = await db
    .select({
      domain: lifeItems.domain,
      createdAt: lifeItems.createdAt,
      updatedAt: lifeItems.updatedAt,
      status: lifeItems.status,
      dueAt: lifeItems.dueAt,
    })
    .from(lifeItems)
    .where(eq(lifeItems.userId, userId));

  // Group items by domain
  const domainMap = new Map<string, typeof items>();
  for (const item of items) {
    if (!item.domain) continue;
    const existing = domainMap.get(item.domain) ?? [];
    existing.push(item);
    domainMap.set(item.domain, existing);
  }

  return ALL_DOMAINS.map((domain) => {
    const domainItems = domainMap.get(domain) ?? [];

    if (domainItems.length === 0) {
      return {
        domain,
        status: "unknown" as HealthStatus,
        lastActivity: null,
        itemCount: 0,
        overdueCount: 0,
      };
    }

    // Find the most recent activity (max of createdAt, updatedAt across all items)
    let lastActivityDate: Date | null = null;
    for (const item of domainItems) {
      const candidates = [item.createdAt, item.updatedAt].filter(Boolean) as Date[];
      for (const d of candidates) {
        if (!lastActivityDate || d > lastActivityDate) {
          lastActivityDate = d;
        }
      }
    }

    // Count items active in the last 14 days
    const recentItems = domainItems.filter((item) => {
      const latest = item.updatedAt ?? item.createdAt;
      return latest >= fourteenDaysAgo;
    });

    // Count overdue tasks (dueAt in the past, status = "active")
    const overdueCount = domainItems.filter((item) => {
      return item.status === "active" && item.dueAt && item.dueAt < now;
    }).length;

    // Classify health
    const daysSince = lastActivityDate
      ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      domain,
      status: classifyHealth(daysSince),
      lastActivity: formatRelativeTime(lastActivityDate),
      itemCount: recentItems.length,
      overdueCount,
    };
  });
}
