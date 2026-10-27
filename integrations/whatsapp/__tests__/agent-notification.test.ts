import { beforeEach, describe, expect, test, vi } from "vitest"

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }))

vi.mock("ky", () => ({
  default: { create: () => ({ post: mockPost }) },
}))

import {
  sendAgentNotification,
  toTemplateParam,
} from "../src/api/agent-notification"

const auth = {
  tokens: { accessToken: "token" },
  version: "v25.0",
} as unknown as Parameters<typeof sendAgentNotification>[0]["auth"]

describe("toTemplateParam", () => {
  test("flattens newlines and tabs Meta rejects in template parameters", () => {
    expect(toTemplateParam("hola\ncómo\testás")).toBe("hola cómo estás")
  })

  test("collapses runs of 4+ spaces", () => {
    expect(toTemplateParam("a      b")).toBe("a   b")
  })

  test("never sends an empty parameter", () => {
    expect(toTemplateParam("  \n ")).toBe("-")
  })
})

describe("sendAgentNotification", () => {
  beforeEach(() => {
    mockPost.mockReset()
    mockPost.mockReturnValue({ json: () => Promise.resolve({}) })
  })

  test("sends the template with the body parameters in order", async () => {
    await sendAgentNotification({
      auth,
      phoneNumberId: "111",
      to: "+57 300 612 1465",
      templateName: "aviso_agente",
      templateLanguage: "es",
      bodyParams: ["Ana", "+56911112222", "quiere\nuna demo", "https://x/h"],
      fallbackText: "unused",
    })

    const [url, options] = mockPost.mock.calls[0] ?? []
    expect(url).toContain("/v25.0/111/messages")
    expect(options.json).toMatchObject({
      to: "573006121465",
      type: "template",
      template: {
        name: "aviso_agente",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Ana" },
              { type: "text", text: "+56911112222" },
              { type: "text", text: "quiere una demo" },
              { type: "text", text: "https://x/h" },
            ],
          },
        ],
      },
    })
  })

  test("falls back to plain text without a template", async () => {
    await sendAgentNotification({
      auth,
      phoneNumberId: "111",
      to: "573006121465",
      templateLanguage: "es",
      bodyParams: [],
      fallbackText: "Nuevo cliente",
    })

    const [, options] = mockPost.mock.calls[0] ?? []
    expect(options.json).toMatchObject({
      type: "text",
      text: { body: "Nuevo cliente" },
    })
  })
})
