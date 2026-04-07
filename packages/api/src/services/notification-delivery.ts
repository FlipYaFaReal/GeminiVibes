import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { db } from "../db";
import { users, nudges } from "../db/schema";
import { eq } from "drizzle-orm";

const expo = new Expo();

/**
 * Deliver a nudge as a push notification to the user's device.
 *
 * Returns `true` if the notification was successfully sent, `false` otherwise.
 * Gracefully handles missing/invalid push tokens.
 */
export async function deliverNudgeNotification(
  nudgeId: string,
  userId: string,
): Promise<boolean> {
  // Get user's push token
  const [user] = await db
    .select({ pushToken: users.pushToken })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
    console.log(
      `[notification] No valid push token for user ${userId}`,
    );
    return false;
  }

  // Get nudge content
  const [nudge] = await db
    .select()
    .from(nudges)
    .where(eq(nudges.id, nudgeId))
    .limit(1);

  if (!nudge) {
    console.log(`[notification] Nudge ${nudgeId} not found`);
    return false;
  }

  const message: ExpoPushMessage = {
    to: user.pushToken,
    sound: "default",
    title: "LifePulse",
    body: nudge.message,
    data: { nudgeId: nudge.id, domain: nudge.domain, type: nudge.type },
  };

  try {
    const [result] = await expo.sendPushNotificationsAsync([message]);
    if (result.status === "ok") {
      // Mark nudge as delivered
      await db
        .update(nudges)
        .set({ delivered: true, deliveredAt: new Date() })
        .where(eq(nudges.id, nudgeId));
      return true;
    }
    console.error(
      `[notification] Push failed for nudge ${nudgeId}:`,
      result.status === "error" ? result.message : "unknown error",
    );
    return false;
  } catch (error) {
    console.error("[notification] Failed to send push notification:", error);
    return false;
  }
}
