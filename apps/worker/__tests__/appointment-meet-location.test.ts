import { describe, expect, it } from "vitest"
import { buildLocationWithMeetLink } from "../src/default/handlers/sync-external-calendar-event"

const meetLink = "https://meet.google.com/abc-defg-hij"
const fallback = `Si no alcanzas a llegar, puedes conectarte por videollamada: ${meetLink}`

describe("buildLocationWithMeetLink", () => {
  it("uses the Meet room as the place of an online appointment", () => {
    expect(
      buildLocationWithMeetLink({
        locationType: "onlineMeeting",
        locationDetail: "Te enviaremos el enlace por WhatsApp",
        meetLink,
      }),
    ).toBe(meetLink)
  })

  it("keeps the address of an in-person appointment and adds the fallback", () => {
    expect(
      buildLocationWithMeetLink({
        locationType: "inPerson",
        locationDetail: "Coyancura 2283, Providencia, Santiago",
        meetLink,
      }),
    ).toBe(`Coyancura 2283, Providencia, Santiago\n${fallback}`)
  })

  it("adds only the fallback when there is no address", () => {
    expect(
      buildLocationWithMeetLink({
        locationType: "phoneCall",
        locationDetail: null,
        meetLink,
      }),
    ).toBe(fallback)
  })

  it("does not add the link twice", () => {
    const detail = `Coyancura 2283\n${fallback}`
    expect(
      buildLocationWithMeetLink({
        locationType: "inPerson",
        locationDetail: detail,
        meetLink,
      }),
    ).toBe(detail)
  })
})
