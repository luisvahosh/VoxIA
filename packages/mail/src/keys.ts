import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const keys = () =>
  createEnv({
    server: {
      SMTP_SERVER: z
        .url()
        .min(1)
        .default("smtp://username:password@localhost:1025"),
      SMTP_FROM: z.string().min(1),
      // "graph" sends via the Microsoft Graph API (app-only OAuth2 client
      // credentials) instead of SMTP -- see graph-transport.ts. The AZURE_*
      // vars are validated for real presence at first send, not here, so a
      // plain-SMTP deployment never needs to set them.
      MAIL_PROVIDER: z.enum(["smtp", "graph"]).default("smtp"),
      AZURE_TENANT_ID: z.string().optional(),
      AZURE_CLIENT_ID: z.string().optional(),
      AZURE_CLIENT_SECRET: z.string().optional(),
    },
    runtimeEnv: {
      SMTP_SERVER:
        process.env.SMTP_SERVER || "smtp://username:password@localhost:1025",
      SMTP_FROM: process.env.SMTP_FROM,
      MAIL_PROVIDER: process.env.MAIL_PROVIDER,
      AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
      AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
      AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
    },
    skipValidation: process.env.SKIP_ENV_CHECK === "true",
  })

export const mailEnv = keys()
