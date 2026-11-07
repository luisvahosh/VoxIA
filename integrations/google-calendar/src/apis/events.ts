import { z } from "zod"
import { getCalendarClient } from "../client"
import { getGaxiosStatus, handleError } from "../error"
import type {
  GoogleCalendarAuthValue,
  GoogleCalendarEventAttendee,
} from "../schemas"

const eventResponseSchema = z.object({
  id: z.string().min(1),
  hangoutLink: z.string().min(1).nullish(),
})

const toCreateEventResult = (data: unknown) => {
  const parsed = eventResponseSchema.parse(data)
  return { eventId: parsed.id, meetLink: parsed.hangoutLink ?? undefined }
}

export async function createEvent({
  auth,
  calendarId,
  summary,
  description,
  location,
  startAt,
  endAt,
  timeZone,
  attendees,
  eventId,
  createMeetLink,
}: {
  auth: GoogleCalendarAuthValue
  calendarId: string
  summary: string
  description?: string
  location?: string
  startAt: string
  endAt: string
  timeZone: string
  attendees?: GoogleCalendarEventAttendee[]
  eventId: string
  createMeetLink?: boolean
}): Promise<{ eventId: string; meetLink?: string }> {
  try {
    const calendarClient = getCalendarClient(auth)
    const response = await calendarClient.events.insert(
      {
        calendarId,
        sendUpdates: "all",
        // Google ignores `conferenceData` unless this is 1.
        conferenceDataVersion: createMeetLink ? 1 : undefined,
        requestBody: {
          id: eventId,
          summary,
          description,
          location,
          start: { dateTime: startAt, timeZone },
          end: { dateTime: endAt, timeZone },
          attendees,
          conferenceData: createMeetLink
            ? {
                // The deterministic event id doubles as the idempotency key,
                // so a retried job never asks Google for a second Meet room.
                createRequest: {
                  requestId: eventId,
                  conferenceSolutionKey: { type: "hangoutsMeet" },
                },
              }
            : undefined,
        },
      },
      { timeout: 60_000 },
    )

    return toCreateEventResult(response.data)
  } catch (error) {
    if (getGaxiosStatus(error) === 409) {
      try {
        const calendarClient = getCalendarClient(auth)
        const response = await calendarClient.events.get(
          { calendarId, eventId },
          { timeout: 60_000 },
        )
        return toCreateEventResult(response.data)
      } catch (lookupError) {
        return handleError(lookupError, "getEventAfterCreateConflict")
      }
    }
    return handleError(error, "createEvent")
  }
}

export async function cancelEvent({
  auth,
  calendarId,
  eventId,
}: {
  auth: GoogleCalendarAuthValue
  calendarId: string
  eventId: string
}): Promise<void> {
  try {
    const calendarClient = getCalendarClient(auth)
    await calendarClient.events.delete(
      { calendarId, eventId, sendUpdates: "all" },
      { timeout: 60_000 },
    )
  } catch (error) {
    const status = getGaxiosStatus(error)
    if (status === 404 || status === 410) {
      return
    }
    return handleError(error, "cancelEvent")
  }
}
