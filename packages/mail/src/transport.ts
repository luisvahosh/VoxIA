import nodemailer from "nodemailer"
import { createGraphTransporter } from "./graph-transport"
import { mailEnv } from "./keys"

export type SmtpTransportOptions = {
  host: string
  port: number
  username: string
  password: string
}

/** The subset of nodemailer's Transporter that this package's sendMail() actually calls -- also satisfied by the Graph transporter. */
export type MailTransporter = {
  sendMail: (options: {
    from?: string
    to: string
    subject: string
    html: string
  }) => Promise<unknown>
}

/**
 * `options` is always a per-workspace custom SMTP override (the
 * integration-smtp feature) and always goes through nodemailer/SMTP.
 * Only the no-args default (the platform transporter) honors
 * MAIL_PROVIDER=graph.
 */
export const createSmtpTransporter = (
  options?: SmtpTransportOptions,
): MailTransporter => {
  if (!options && mailEnv.MAIL_PROVIDER === "graph") {
    return createGraphTransporter()
  }
  return nodemailer.createTransport(
    options
      ? {
          host: options.host,
          port: options.port,
          secure: options.port === 465,
          auth: { user: options.username, pass: options.password },
        }
      : mailEnv.SMTP_SERVER,
  )
}
