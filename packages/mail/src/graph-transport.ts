import { mailEnv } from "./keys"

/**
 * App-only (client credentials) Microsoft Graph mail sender. No per-user
 * MFA/app-password dependency: a token is minted for the app itself, not a
 * signed-in user, so it works unattended from a server process.
 *
 * The app's `Mail.Send` Application permission can send as any mailbox in
 * the tenant, not just SMTP_FROM -- scope that down with an Exchange Online
 * Application Access Policy if that matters for the deployment.
 */

type GraphToken = { accessToken: string; expiresAt: number }

let cachedToken: GraphToken | null = null

function requireAzureConfig() {
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, SMTP_FROM } =
    mailEnv
  const missing = [
    !AZURE_TENANT_ID && "AZURE_TENANT_ID",
    !AZURE_CLIENT_ID && "AZURE_CLIENT_ID",
    !AZURE_CLIENT_SECRET && "AZURE_CLIENT_SECRET",
    !SMTP_FROM && "SMTP_FROM",
  ].filter((v): v is string => Boolean(v))
  if (missing.length > 0) {
    throw new Error(
      `MAIL_PROVIDER=graph requires ${missing.join(", ")} to be set`,
    )
  }
  return {
    tenantId: AZURE_TENANT_ID as string,
    clientId: AZURE_CLIENT_ID as string,
    clientSecret: AZURE_CLIENT_SECRET as string,
    senderMailbox: SMTP_FROM,
  }
}

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt - 5 * 60 * 1000 > now) {
    return cachedToken.accessToken
  }

  const { tenantId, clientId, clientSecret } = requireAzureConfig()
  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Failed to acquire Microsoft Graph access token (${response.status}): ${body}`,
    )
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }
  return cachedToken.accessToken
}

/** Extracts "user@example.com" from either a bare address or a `"Name" <user@example.com>` header value. */
function extractAddress(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return (match ? match[1] : from).trim()
}

type GraphSendMailOptions = {
  from?: string
  to: string
  subject: string
  html: string
}

/** Minimal shape matching the subset of nodemailer's Transporter that this package's sendMail() calls. */
export type GraphTransporter = {
  sendMail: (options: GraphSendMailOptions) => Promise<void>
}

export const createGraphTransporter = (): GraphTransporter => ({
  sendMail: async ({ from, to, subject, html }) => {
    const { senderMailbox } = requireAzureConfig()
    const token = await getAccessToken()
    const fromAddress = from ? extractAddress(from) : senderMailbox

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderMailbox)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: "HTML", content: html },
            from: { emailAddress: { address: fromAddress } },
            toRecipients: [{ emailAddress: { address: to } }],
          },
          saveToSentItems: false,
        }),
      },
    )

    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `Microsoft Graph sendMail failed (${response.status}): ${body}`,
      )
    }
  },
})
