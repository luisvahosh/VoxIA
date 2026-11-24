// @vitest-environment node

import { beforeEach, describe, expect, test, vi } from "vitest"

const BACK_WITH_ASSISTANT_RE = /back with the assistant/
const FLOW_NOT_FOUND_RE = /Flow not found/

const mocks = vi.hoisted(() => ({
  resolveHandoff: vi.fn(),
  findActiveById: vi.fn(),
  createOutgoing: vi.fn(),
  enableBotState: vi.fn(),
}))

vi.mock("@/lib/safe-action", () => {
  const chain: Record<string, unknown> = {}
  chain.inputSchema = vi.fn(() => chain)
  chain.action = vi.fn((handler: unknown) => handler)
  return { actionClient: chain }
})

vi.mock("@chatbotx.io/business", () => ({
  conversationService: { enableBotState: mocks.enableBotState },
  flowService: { findActiveById: mocks.findActiveById },
  messageService: { createOutgoing: mocks.createOutgoing },
}))

vi.mock("@/features/agent-handoff/lib/resolve-handoff", () => ({
  resolveHandoff: mocks.resolveHandoff,
}))

const { sendHandoffFlowAction } = (await import(
  "../src/app/handoff/actions"
)) as unknown as {
  sendHandoffFlowAction: (args: {
    parsedInput: { token: string; flowId: string }
  }) => Promise<{ sent: boolean }>
}

const conversation = { id: "conv-1", workspaceId: "ws-1" }
const contactInbox = { id: "ci-1" }

describe("sendHandoffFlowAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.resolveHandoff.mockResolvedValue({
      conversation,
      contactInbox,
      active: true,
    })
  })

  test("sends an active flow of the token's workspace", async () => {
    mocks.findActiveById.mockResolvedValue({ id: "flow-1" })

    const result = await sendHandoffFlowAction({
      parsedInput: { token: "tok", flowId: "flow-1" },
    })

    expect(mocks.findActiveById).toHaveBeenCalledWith({
      id: "flow-1",
      workspaceId: "ws-1",
    })
    expect(mocks.createOutgoing).toHaveBeenCalledWith({
      conversation,
      contactInbox,
      input: { flowId: "flow-1" },
    })
    expect(result).toEqual({ sent: true })
  })

  test("rejects a flow that is not active in the workspace", async () => {
    mocks.findActiveById.mockResolvedValue(undefined)

    await expect(
      sendHandoffFlowAction({
        parsedInput: { token: "tok", flowId: "other-ws-flow" },
      }),
    ).rejects.toThrow(FLOW_NOT_FOUND_RE)
    expect(mocks.createOutgoing).not.toHaveBeenCalled()
  })

  test("rejects when the conversation is back with the assistant", async () => {
    mocks.resolveHandoff.mockResolvedValue({
      conversation,
      contactInbox,
      active: false,
    })

    await expect(
      sendHandoffFlowAction({
        parsedInput: { token: "tok", flowId: "flow-1" },
      }),
    ).rejects.toThrow(BACK_WITH_ASSISTANT_RE)
    expect(mocks.findActiveById).not.toHaveBeenCalled()
    expect(mocks.createOutgoing).not.toHaveBeenCalled()
  })
})
