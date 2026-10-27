import { z } from "zod"
import {
  signAppointmentToken,
  verifyAppointmentToken,
} from "./appointment-token-utils"

const TOKEN_AAD = "agent-handoff-token"
const DEFAULT_TOKEN_TTL_MS = 72 * 60 * 60 * 1000

export const agentHandoffPayloadSchema = z.object({
  workspaceId: z.string().min(1),
  conversationId: z.string().min(1),
  contactInboxId: z.string().min(1),
  expiresAt: z.number(),
})

export type AgentHandoffPayload = z.infer<typeof agentHandoffPayloadSchema>

/**
 * Signs the link a "Notify agent" flow step sends to a human agent's
 * WhatsApp, letting them read and answer one conversation without a VoxIA
 * session. The token is scoped to that single conversation; the page also
 * refuses it once the bot is enabled again, so handing the conversation back
 * to the assistant closes the link before it expires.
 */
export async function signAgentHandoffToken(
  payload: Omit<AgentHandoffPayload, "expiresAt">,
  ttlMs = DEFAULT_TOKEN_TTL_MS,
): Promise<string> {
  return await signAppointmentToken(
    { ...payload, expiresAt: Date.now() + ttlMs },
    TOKEN_AAD,
  )
}

export async function verifyAgentHandoffToken(
  token: string,
): Promise<AgentHandoffPayload> {
  return await verifyAppointmentToken(
    token,
    TOKEN_AAD,
    agentHandoffPayloadSchema,
  )
}
