import { beforeEach, describe, expect, test, vi } from "vitest"

const { mockApiFetch, mockSendMessage, mockGetWhatsappClient } = vi.hoisted(
  () => {
    const apiFetch = vi.fn()
    const sendMessageFn = vi.fn()
    return {
      mockApiFetch: apiFetch,
      mockSendMessage: sendMessageFn,
      mockGetWhatsappClient: vi.fn(() => ({
        $$apiFetch$$: apiFetch,
        sendMessage: sendMessageFn,
      })),
    }
  },
)

vi.mock("../src/client", () => ({
  getWhatsappClient: mockGetWhatsappClient,
}))

vi.mock("../src/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const { sendMessage } = await import("../src/handlers/message/outgoing-message")

const ctx = {
  auth: { metadata: { phoneNumber: { id: "pn-1" } } },
} as never

const contact = { id: "contact-1", sourceId: "56912345678" } as never

const sentMessages = () =>
  mockSendMessage.mock.calls.map(
    (call) => JSON.parse(JSON.stringify(call[2])) as Record<string, unknown>,
  )

describe("WhatsApp sendMessage — url quick replies", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendMessage.mockResolvedValue({
      messaging_product: "whatsapp",
      messages: [{ id: "wamid.lib-1" }],
    })
  })

  test("sends a url quick reply as a cta_url button carrying the text", async () => {
    await sendMessage({
      ctx,
      data: {
        contact,
        message: {
          id: "msg-1",
          contentType: "text",
          text: "Elige el día y la hora de tu cita",
        },
        quickReplies: [
          {
            id: "qr-1",
            label: "Elegir hora",
            buttonType: "url",
            url: "https://app.example.test/booking/picker?token=abc",
          },
        ],
      },
    } as never)

    expect(mockApiFetch).not.toHaveBeenCalled()
    expect(mockSendMessage).toHaveBeenCalledTimes(1)
    expect(sentMessages()[0]).toMatchObject({
      type: "cta_url",
      body: { text: "Elige el día y la hora de tu cita" },
      action: {
        name: "cta_url",
        parameters: {
          display_text: "Elegir hora",
          url: "https://app.example.test/booking/picker?token=abc",
        },
      },
    })
  })

  test("still sends plain text when there are no url quick replies", async () => {
    await sendMessage({
      ctx,
      data: {
        contact,
        message: { id: "msg-2", contentType: "text", text: "hola" },
      },
    } as never)

    expect(mockSendMessage).toHaveBeenCalledTimes(1)
    expect(sentMessages()[0]).toMatchObject({ body: "hola" })
  })
})
