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
 */
export const notifyAgentStepSchema = z.object({
  id: zodBigintAsString(),
  stepType: z.literal(stepTypes.enum.notifyAgent),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?\d{8,15}$/),
  templateName: z.string().trim().default(""),
  templateLanguage: z.string().trim().min(2).default("es"),
  disableBot: z.boolean().default(true),
  states: z.tuple([successStateSchema, errorStateSchema]),
})

export type NotifyAgentStepSchema = z.infer<typeof notifyAgentStepSchema>

export const notifyAgentStepDefaultFn = (
  props?: Partial<NotifyAgentStepSchema>,
): NotifyAgentStepSchema => ({
  id: createId(),
  stepType: stepTypes.enum.notifyAgent,
  phoneNumber: "",
  templateName: "aviso_agente",
  templateLanguage: "es",
  disableBot: true,
  states: [successStateDefaultFn(), errorStateDefaultFn()],
  ...props,
})
