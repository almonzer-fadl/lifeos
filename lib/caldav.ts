// iCloud CalDAV integration
// Requires: APPLE_ID and APPLE_APP_PASSWORD env vars
// iCloud needs an app-specific password (not account password)
// Generate at: https://appleid.apple.com → Sign-In and Security → App-Specific Passwords

import { db } from "@/lib/db";

const CALDAV_URL = process.env.CALDAV_URL || "https://caldav.icloud.com";
const APPLE_ID = process.env.APPLE_ID;
const APPLE_APP_PASSWORD = process.env.APPLE_APP_PASSWORD;

// We dynamically import ts-caldav to avoid requiring it on all page loads
async function getClient() {
  const { CalDAVClient } = await import("ts-caldav");
  return CalDAVClient.create({
    baseUrl: CALDAV_URL,
    auth: {
      type: "basic" as const,
      username: APPLE_ID!,
      password: APPLE_APP_PASSWORD!,
    },
  });
}

export interface CalDAVEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  calendar: string;
  etag: string;
  url: string;
}

export async function isCalDAVConfigured(): Promise<boolean> {
  return !!(APPLE_ID && APPLE_APP_PASSWORD);
}

export async function syncCalDAVEvents(daysAhead = 30) {
  if (!isCalDAVConfigured()) {
    return { synced: 0, error: "CalDAV not configured — set APPLE_ID and APPLE_APP_PASSWORD" };
  }

  try {
    const client = await getClient();
    const calendars = await client.getCalendars();

    let totalSynced = 0;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + daysAhead);

    for (const cal of calendars) {
      try {
        const events = await client.getEvents(cal.url, {
          start,
          end,
        });

        for (const event of events) {
          const uid = event.uid || `${event.summary}-${event.start?.toISOString()}`;
          const startTime = event.start ? new Date(event.start) : new Date();
          const endTime = event.end ? new Date(event.end) : new Date();
          const calName = (cal as unknown as { name?: string }).name || "Default";

          const existing = await db.calendarEvent.findFirst({
            where: { externalId: uid },
          });

          if (existing) {
            await db.calendarEvent.update({
              where: { id: existing.id },
              data: {
                title: event.summary || "Untitled",
                description: event.description || null,
                startTime,
                endTime,
                location: event.location || null,
              },
            });
          } else {
            await db.calendarEvent.create({
              data: {
                externalId: uid,
                title: event.summary || "Untitled",
                description: event.description || null,
                startTime,
                endTime,
                location: event.location || null,
                source: "caldav",
              },
            });
          }
          totalSynced++;
        }
      } catch (err) {
        console.error(`[caldav] Failed to sync calendar:`, err);
      }
    }

    return { synced: totalSynced };
  } catch (err) {
    console.error("[caldav] Sync failed:", err);
    return { synced: 0, error: String(err) };
  }
}
