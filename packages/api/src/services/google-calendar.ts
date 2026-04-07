import { google } from "googleapis";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

async function getAuthenticatedClient(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.googleAccessToken) {
    throw new Error("No Google credentials for user");
  }

  const client = createOAuth2Client();
  client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  // Handle token refresh — persist new tokens when Google rotates them
  client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await db
        .update(users)
        .set({
          googleAccessToken: tokens.access_token,
          ...(tokens.refresh_token
            ? { googleRefreshToken: tokens.refresh_token }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  });

  return client;
}

export async function getUpcomingEvents(
  userId: string,
  hours = 48,
): Promise<string[]> {
  try {
    const auth = await getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    return (res.data.items ?? []).map((event) => {
      const start = event.start?.dateTime || event.start?.date || "";
      return `${start} - ${event.summary || "Untitled"}`;
    });
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    return [];
  }
}

export async function createCalendarEvent(
  userId: string,
  event: {
    title: string;
    start: string;
    end?: string;
    location?: string;
  },
): Promise<string | null> {
  try {
    const auth = await getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const startTime = event.start;
    const endTime =
      event.end ||
      new Date(
        new Date(event.start).getTime() + 60 * 60 * 1000,
      ).toISOString();

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        start: { dateTime: startTime },
        end: { dateTime: endTime },
        ...(event.location ? { location: event.location } : {}),
      },
    });

    return res.data.id ?? null;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return null;
  }
}
