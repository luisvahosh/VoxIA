import { createId, zodBigintAsString } from "@chatbotx.io/utils"
import { z } from "zod"
import {
  errorStateDefaultFn,
  errorStateSchema,
  successStateDefaultFn,
  successStateSchema,
} from "../states"
import { stepTypes } from "./step-action"

/**
 * Hands a conversation to a human agent who is not in the inbox: pauses the
 * bot and sends the agent a WhatsApp (from the workspace's WhatsApp number)
 * with the contact, a short summary and a link to read and answer the
 * conversation without signing in.
 *
 * `templateName` is the approved Meta template to use (body variables, in
 * order: contact name, contact phone, summary, link). Left empty, a plain text
 * is sent instead — Meta only delivers that when the agent wrote to the
 * business number in the last 24 hours.
 *
 * `mode: "appointment"` turns the step into a copy of a booking for the
 * professional (used in an appointment calendar's confirmation flow): no bot
 * pause and no handoff link; body variables, in order: contact name, contact
 * phone, appointment date, appointment time, calendar name / location.
 *
 * `contactPhone` is where the patient's phone comes from when the channel does
 * not share it (Instagram, Messenger, webchat, or a WhatsApp user whose number
 * Meta hides behind a username) — usually a custom field filled by the AI
 * agent, e.g. `{{telefono}}`. It is saved on the contact when it has none.
 */
export const notifyAgentModes = z.enum(["handoff", "appointment"])

export type NotifyAgentMode = z.infer<typeof notifyAgentModes>

export const notifyAgentStepSchema = z.object({
  id: zodBigintAsString(),
  stepType: z.literal(stepTypes.enum.notifyAgent),
  mode: notifyAgentModes.default(notifyAgentModes.enum.handoff),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?\d{8,15}$/),
  templateName: z.string().trim().default(""),
  templateLanguage: z.string().trim().min(2).default("es"),
  disableBot: z.boolean().default(true),
  contactPhone: z.string().trim().max(200).default(""),
  states: z.tuple([successStateSchema, errorStateSchema]),
})

export type NotifyAgentStepSchema = z.infer<typeof notifyAgentStepSchema>

export const notifyAgentStepDefaultFn = (
  props?: Partial<NotifyAgentStepSchema>,
): NotifyAgentStepSchema => ({
  id: createId(),
  stepType: stepTypes.enum.notifyAgent,
  mode: notifyAgentModes.enum.handoff,
  phoneNumber: "",
  templateName: "aviso_agente",
  templateLanguage: "es",
  disableBot: true,
  contactPhone: "",
  states: [successStateDefaultFn(), errorStateDefaultFn()],
  ...props,
})
