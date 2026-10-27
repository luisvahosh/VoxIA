import "server-only"

import { contactInboxService, conversationService } from "@chatbotx.io/business"
import { notFoundException } from "@chatbotx.io/business/errors"
import { verifyAgentHandoffToken } from "@chatbotx.io/encryption"

/**
 * Resolves the conversation an agent handoff link points at. The signed token
 * is the only authorisation on this public route, so every read and write goes
 * through here: the conversation is re-read uncached and the link only allows
 * replies while the bot is still paused (`active`).
 */
export async function resolveHandoff(token: string) {
  const payload = await verifyAgentHandoffToken(token)
  const conversation = await conversationService.findByUncached({
    where: { id: payload.conversationId, workspaceId: payload.workspaceId },
  })
  if (!conversation) {
    throw notFoundException("Conversation not found")
  }
  const contactInbox = await contactInboxService.findByUncached({
    where: { id: payload.contactInboxId, contactId: conversation.contactId },
  })
  if (!contactInbox) {
    throw notFoundException("Inbox not found")
  }
  return {
    payload,
    conversation,
    contactInbox,
    active: !conversation.botEnabled,
  }
}
