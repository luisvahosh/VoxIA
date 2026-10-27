import {
  contactService,
  conversationService,
  integrationWhatsappService,
  messageService,
  resolveTenantSettings,
} from "@chatbotx.io/business"
import { signAgentHandoffToken } from "@chatbotx.io/encryption"
import type { NotifyAgentStepSchema } from "@chatbotx.io/flow-config"
import type { WhatsappAuthValue } from "@chatbotx.io/integration-whatsapp"
import { sendAgentNotification } from "@chatbotx.io/integration-whatsapp/api/agent-notification"
import { logger } from "../../lib/logger"
import type { ExecuteStepProps } from "./flow-utils"
import type { ExecuteStepResult } from "./step"

const LEADING_PLUS = /^\+/

const SUMMARY_MESSAGE_COUNT = 3
const RECENT_MESSAGE_LIMIT = 15
const MAX_SUMMARY_LENGTH = 300

/**
 * The WhatsApp number the agent is notified from: the conversation's own
 * number when it is a WhatsApp conversation, otherwise the workspace's first
 * connected WhatsApp number (a Telegram or webchat lead still alerts the agent
 * on WhatsApp).
 */
async function resolveSenderIntegration(
  workspaceId: string,
  contactInbox: ExecuteStepProps<NotifyAgentStepSchema>["contactInbox"],
) {
  const integrations =
    await integrationWhatsappService.listByWorkspaceId(workspaceId)
  return (
    integrations.find(
      (integration) => integration.inboxId === contactInbox.inboxId,
    ) ?? integrations[0]
  )
}

/** The contact's last few messages, oldest first, as one line. */
async function buildSummary(props: {
  workspaceId: string
  conversationId: string
}): Promise<string> {
  const { data } = await messageService.listForConversation({
    workspaceId: props.workspaceId,
    conversationId: props.conversationId,
    limit: RECENT_MESSAGE_LIMIT,
  })
  const texts = data
    .filter((message) => message.senderType === "contact" && message.text)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-SUMMARY_MESSAGE_COUNT)
    .map((message) => message.text?.trim() ?? "")
  return texts.join(" / ").slice(0, MAX_SUMMARY_LENGTH)
}

export async function handleNotifyAgent(
  props: ExecuteStepProps<NotifyAgentStepSchema>,
): Promise<ExecuteStepResult> {
  const { step, conversation, contactInbox } = props
  const { workspaceId } = conversation

  try {
    const integration = await resolveSenderIntegration(
      workspaceId,
      contactInbox,
    )
    if (!integration) {
      return {
        status: "error",
        result: null,
        errorMessage: "The workspace has no WhatsApp number to notify from",
      }
    }

    if (step.disableBot) {
      await conversationService.disableBotState({
        workspaceId,
        conversations: [conversation],
        triggerContext: {
          triggerSource: "worker",
          triggerHandler: "handleNotifyAgent",
          triggerType: "flow_action",
        },
      })
    }

    const contact = await contactService.findById({
      workspaceId,
      id: conversation.contactId,
    })
    const contactName = contact?.fullName?.trim() || contactInbox.sourceId
    const contactPhone =
      contactInbox.channel === "whatsapp"
        ? `+${contactInbox.sourceId.replace(LEADING_PLUS, "")}`
        : (contact?.phoneNumber ?? contactInbox.channel)
    const summary = await buildSummary({
      workspaceId,
      conversationId: conversation.id,
    })

    const { appUrl } = await resolveTenantSettings({ workspaceId })
    const token = await signAgentHandoffToken({
      workspaceId,
      conversationId: conversation.id,
      contactInboxId: contactInbox.id,
    })
    const link = new URL("/handoff", appUrl)
    link.searchParams.set("token", token)

    await sendAgentNotification({
      auth: integration.auth as WhatsappAuthValue,
      phoneNumberId: integration.phoneNumberId,
      to: step.phoneNumber,
      templateName: step.templateName || undefined,
      templateLanguage: step.templateLanguage,
      bodyParams: [contactName, contactPhone, summary, link.toString()],
      fallbackText: [
        `🔔 ${contactName} (${contactPhone})`,
        summary,
        link.toString(),
      ]
        .filter(Boolean)
        .join("\n\n"),
    })

    return { status: "success", result: { notified: step.phoneNumber } }
  } catch (error) {
    logger.error(
      { err: error, conversationId: conversation.id },
      "[handleNotifyAgent] failed to notify the agent",
    )
    return {
      status: "error",
      result: null,
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  }
}
