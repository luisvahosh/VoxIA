import ky from "ky"
import type { WhatsappAuthValue } from ".."
import { API_URL, DEFAULT_API_VERSION } from "../constants"
import { rescue } from "../exception"

const api = ky.create({
  timeout: 30_000,
})

/** Meta rejects template parameters with newlines, tabs or 5+ spaces in a row. */
const MAX_TEMPLATE_PARAM_LENGTH = 1000

export function toTemplateParam(value: string): string {
  const flattened = value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {4,}/g, "   ")
    .trim()
  return flattened.slice(0, MAX_TEMPLATE_PARAM_LENGTH) || "-"
}

/**
 * Sends a WhatsApp from the business number to a human agent (not a contact
 * of the workspace). With `templateName` it sends that approved template with
 * `bodyParams` as its body variables — the only form Meta delivers outside the
 * 24-hour window; without it, a plain text (`fallbackText`).
 */
export function sendAgentNotification({
  auth,
  phoneNumberId,
  to,
  templateName,
  templateLanguage,
  bodyParams,
  fallbackText,
}: {
  auth: WhatsappAuthValue
  phoneNumberId: string
  to: string
  templateName?: string
  templateLanguage: string
  bodyParams: string[]
  fallbackText: string
}): Promise<unknown> {
  const { version = DEFAULT_API_VERSION } = auth
  const recipient = to.replace(/\D/g, "")

  const message = templateName
    ? {
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [
            {
              type: "body",
              parameters: bodyParams.map((text) => ({
                type: "text",
                text: toTemplateParam(text),
              })),
            },
          ],
        },
      }
    : {
        type: "text",
        text: { preview_url: true, body: fallbackText },
      }

  return rescue(() =>
    api
      .post(`${API_URL}/${version}/${phoneNumberId}/messages`, {
        json: {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          ...message,
        },
        headers: {
          Authorization: `Bearer ${auth.tokens.accessToken}`,
        },
      })
      .json(),
  )
}
