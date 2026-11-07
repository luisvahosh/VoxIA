import { beforeEach, describe, expect, it, vi } from "vitest"

const insert = vi.fn()
const get = vi.fn()

vi.mock("../src/client", () => ({
  getCalendarClient: () => ({ events: { insert, get } }),
}))

const { createEvent } = await import("../src/apis/events")

const auth = {
  authType: "oauth2",
  clientId: "client",
  clientSecret: "secret",
  redirectUrl: "https://example.com/callback",
  tokens: { accessToken: "token" },
} as Parameters<typeof createEvent>[0]["auth"]

const baseInput = {
  auth,
  calendarId: "primary",
  summary: "Consulta",
  startAt: "2026-11-10T17:00:00.000Z",
  endAt: "2026-11-10T17:30:00.000Z",
  timeZone: "America/Santiago",
  eventId: "abe123",
}

describe("createEvent", () => {
  beforeEach(() => {
    insert.mockReset()
    get.mockReset()
  })

  it("does not request a Meet room by default", async () => {
    insert.mockResolvedValue({ data: { id: "abe123" } })

    const result = await createEvent(baseInput)

    expect(result).toEqual({ eventId: "abe123", meetLink: undefined })
    const [params] = insert.mock.calls[0] ?? []
    expect(params.conferenceDataVersion).toBeUndefined()
    expect(params.requestBody.conferenceData).toBeUndefined()
  })

  it("requests a Meet room keyed by the event id and returns its link", async () => {
    insert.mockResolvedValue({
      data: {
        id: "abe123",
        hangoutLink: "https://meet.google.com/abc-defg-hij",
      },
    })

    const result = await createEvent({ ...baseInput, createMeetLink: true })

    expect(result).toEqual({
      eventId: "abe123",
      meetLink: "https://meet.google.com/abc-defg-hij",
    })
    const [params] = insert.mock.calls[0] ?? []
    expect(params.conferenceDataVersion).toBe(1)
    expect(params.requestBody.conferenceData).toEqual({
      createRequest: {
        requestId: "abe123",
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    })
  })

  it("returns the existing Meet link when the event already exists", async () => {
    insert.mockRejectedValue(
      Object.assign(new Error("exists"), { response: { status: 409 } }),
    )
    get.mockResolvedValue({
      data: {
        id: "abe123",
        hangoutLink: "https://meet.google.com/abc-defg-hij",
      },
    })

    const result = await createEvent({ ...baseInput, createMeetLink: true })

    expect(result).toEqual({
      eventId: "abe123",
      meetLink: "https://meet.google.com/abc-defg-hij",
    })
  })
})
