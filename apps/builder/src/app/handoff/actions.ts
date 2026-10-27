"use server"

import { conversationService, messageService } from "@chatbotx.io/business"
import { z } from "zod"
import { resolveHandoff } from "@/features/agent-handoff/lib/resolve-handoff"
import { actionClient } from "@/lib/safe-action"

const HANDOFF_TRIGGER_CONTEXT = {
  triggerSource: "api",
  triggerHandler: "agentHandoffPage",
  triggerType: "agent_handoff",
} as const

export const sendHandoffReplyAction = actionClient
  .inputSchema(
    z.object({
      token: z.string().min(1),
      text: z.string().trim().min(1).max(1000),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { conversation, contactInbox, active } = await resolveHandoff(
      parsedInput.token,
    )
    if (!active) {
      throw new Error("Conversation is back with the assistant")
    }
    await messageService.createOutgoing({
      conversation,
      contactInbox,
      input: { text: parsedInput.text },
    })
    return { sent: true }
  })

export const returnHandoffToBotAction = actionClient
  .inputSchema(z.object({ token: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const { conversation, active } = await resolveHandoff(parsedInput.token)
    if (active) {
      await conversationService.enableBotState({
        workspaceId: conversation.workspaceId,
        conversations: [conversation],
        triggerContext: HANDOFF_TRIGGER_CONTEXT,
      })
    }
    return { returned: true }
  })
