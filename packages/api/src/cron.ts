import cron from "node-cron";
import { db } from "./db";
import { users } from "./db/schema";
import { generateNudges } from "./services/nudge-generator";

export function startCronJobs() {
  // Run nudge generation every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("[cron] Running nudge generation...");
    try {
      const allUsers = await db.select({ id: users.id }).from(users);
      for (const user of allUsers) {
        try {
          const created = await generateNudges(user.id);
          if (created.length > 0) {
            console.log(
              `[cron] Generated ${created.length} nudge(s) for user ${user.id}`,
            );
          }
        } catch (error) {
          console.error(
            `[cron] Nudge generation failed for user ${user.id}:`,
            error,
          );
        }
      }
      console.log("[cron] Nudge generation complete.");
    } catch (error) {
      console.error("[cron] Failed to fetch users for nudge generation:", error);
    }
  });

  console.log("[cron] Scheduled nudge generation every 6 hours.");
}
