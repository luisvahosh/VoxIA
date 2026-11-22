import {
  appointmentService,
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
import { contactVariableService } from "@chatbotx.io/variables"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { logger } from "../../lib/logger"
import type { ExecuteStepProps } from "./flow-utils"
import type { ExecuteStepResult } from "./step"

const PHONE_NUMBER = /^\+?\d{6,15}$/

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
  contactInbox: NotifyAgentProps["contactInbox"],
) {
  const integrations =
    await integrationWhatsappService.listByWorkspaceId(workspaceId)
  return (
    integrations.find(
      (integration) => integration.inboxId === contactInbox.inboxId,
    ) ?? integrations[0]
  )
}

/**
 * A phone typed by the contact ("+56 9 1234 5678", "912345678") as E.164.
 * Numbers without a country code take the region of the agent's number (the
 * same country as the business in practice).
 */
function normalizePhone(
  raw: string | null | undefined,
  agentPhone: string,
): string | undefined {
  const value = raw?.trim()
  if (!value || value.includes("{{")) {
    return
  }
  const region = parsePhoneNumberFromString(agentPhone)?.country
  // Do not use isValid(); it rejects well-formed but unassigned numbers.
  return parsePhoneNumberFromString(value, region)?.number
}

type NotifyAgentProps = ExecuteStepProps<NotifyAgentStepSchema>

/**
 * The contact's phone for the agent, never a placeholder: the WhatsApp number,
 * then the contact's saved phone, then the step's `contactPhone` (a phone the
 * AI agent asked for, saved on the contact for next time). Only if all are
 * missing does it fall back to the WhatsApp username or the channel, so the
 * agent can still find the chat in the inbox.
 */
async function resolveContactPhone(
  props: NotifyAgentProps,
  contact: Awaited<ReturnType<typeof contactService.findById>>,
): Promise<string> {
  const { step, conversation, contactInbox } = props
  if (
    contactInbox.channel === "whatsapp" &&
    PHONE_NUMBER.test(contactInbox.sourceId)
  ) {
    return `+${contactInbox.sourceId.replace("+", "")}`
  }
  if (contact?.phoneNumber?.trim()) {
    return contact.phoneNumber.trim()
  }

  if (step.contactPhone) {
    const variables = await contactVariableService.getAll({
      contactId: conversation.contactId,
      contactInbox,
      conversation,
    })
    const typed = await contactVariableService.replaceAll({
      text: step.contactPhone,
      variables,
    })
    const phone = normalizePhone(typed, step.phoneNumber)
    if (phone) {
      if (contact) {
        await contactService
          .update(
            { workspaceId: conversation.workspaceId, id: contact.id },
            { phoneNumber: phone },
          )
          .catch((error: unknown) =>
            logger.warn(
              { err: error, contactId: contact.id },
              "[handleNotifyAgent] could not save the phone on the contact",
            ),
          )
      }
      return phone
    }
  }

  const username = contactInbox.sourceUsername?.trim()
  return username ? `WhatsApp @${username}` : contactInbox.channel
}

const APPOINTMENT_LOCALE = "es-CL"

/**
 * The booking copy sent to the professional: date and time in the calendar's
 * timezone, and where (calendar name, plus its location detail when set).
 */
async function buildAppointmentDetails(props: {
  workspaceId: string
  appointmentId: string
}) {
  const appointment = await appointmentService.findByOrFail({
    workspaceId: props.workspaceId,
    id: props.appointmentId,
  })
  const timeZone = appointment.calendar.timezone
  const date = new Intl.DateTimeFormat(APPOINTMENT_LOCALE, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(appointment.startAt)
  const time = new Intl.DateTimeFormat(APPOINTMENT_LOCALE, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(appointment.startAt)
  const place = [appointment.calendar.name, appointment.locationDetail?.trim()]
    .filter(Boolean)
    .join(" - ")
  return { date, time, place }
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
  props: NotifyAgentProps,
): Promise<ExecuteStepResult> {
  const { step, conversation, contactInbox } = props
  const { workspaceId } = conversation
  const isAppointmentNotice = step.mode === "appointment"

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

    if (isAppointmentNotice && !props.appointmentId) {
      return {
        status: "error",
        result: null,
        errorMessage:
          "Appointment notice needs an appointment: use it in an appointment calendar's confirmation flow",
      }
    }

    if (step.disableBot && !isAppointmentNotice) {
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
    const contactPhone = await resolveContactPhone(props, contact)

    if (isAppointmentNotice && props.appointmentId) {
      const { date, time, place } = await buildAppointmentDetails({
        workspaceId,
        appointmentId: props.appointmentId,
      })
      await sendAgentNotification({
        auth: integration.auth as WhatsappAuthValue,
        phoneNumberId: integration.phoneNumberId,
        to: step.phoneNumber,
        templateName: step.templateName || undefined,
        templateLanguage: step.templateLanguage,
        bodyParams: [contactName, contactPhone, date, time, place],
        fallbackText: [
          `📅 ${contactName} (${contactPhone})`,
          `${date}, ${time}`,
          place,
        ]
          .filter(Boolean)
          .join("\n"),
      })
      return { status: "success", result: { notified: step.phoneNumber } }
    }

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
