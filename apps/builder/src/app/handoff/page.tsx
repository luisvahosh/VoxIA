import {
  contactService,
  messageService,
  workspaceService,
} from "@chatbotx.io/business"
import type { Metadata } from "next"
import { createTranslator, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import {
  HandoffChat,
  type HandoffChatMessage,
} from "@/features/agent-handoff/components/handoff-chat"
import { resolveHandoff } from "@/features/agent-handoff/lib/resolve-handoff"
import { loadWorkspaceMessages } from "@/i18n/workspace-locale"

const LEADING_PLUS = /^\+/

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MESSAGE_LIMIT = 60

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agentHandoff")
  return {
    title: t("metadataTitle"),
    robots: { index: false, follow: false },
  }
}

async function tryResolveHandoff(token: string | undefined) {
  if (!token) {
    return null
  }
  try {
    return await resolveHandoff(token)
  } catch {
    return null
  }
}

export default async function AgentHandoffPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const t = await getTranslations("agentHandoff")
  const token = (await searchParams).token
  const handoff = await tryResolveHandoff(token)

  if (!(token && handoff)) {
    return (
      <PublicMessage
        description={t("invalidDescription")}
        title={t("invalidTitle")}
      />
    )
  }

  const { conversation, contactInbox, active } = handoff
  // The agent has no locale cookie, so render in the workspace language.
  const workspace = await workspaceService.findById({
    id: conversation.workspaceId,
  })
  const { locale, messages } = loadWorkspaceMessages(workspace.language)
  const st = createTranslator({ locale, messages, namespace: "agentHandoff" })

  if (!active) {
    return (
      <PublicMessage
        description={st("closedDescription")}
        title={st("closedTitle")}
      />
    )
  }

  const contact = await contactService.findById({
    workspaceId: conversation.workspaceId,
    id: conversation.contactId,
  })
  const { data } = await messageService.listForConversation({
    workspaceId: conversation.workspaceId,
    conversationId: conversation.id,
    limit: MESSAGE_LIMIT,
  })
  const chatMessages: HandoffChatMessage[] = data
    .filter((message) => message.messageType !== "activity")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((message) => ({
      id: message.id,
      text: message.text,
      senderType: message.senderType,
      createdAt: message.createdAt.toISOString(),
      hasAttachment: message.attachments.length > 0,
    }))

  const contactName = contact?.fullName?.trim() || contactInbox.sourceId
  const contactPhone =
    contactInbox.channel === "whatsapp"
      ? `+${contactInbox.sourceId.replace(LEADING_PLUS, "")}`
      : contact?.phoneNumber

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-4">
      <header className="space-y-1">
        <p className="text-muted-foreground text-xs">{workspace.name}</p>
        <h1 className="font-semibold text-xl">
          {st("contactLabel")}: {contactName}
        </h1>
        {contactPhone ? (
          <p className="text-muted-foreground text-sm">{contactPhone}</p>
        ) : null}
        <p className="text-muted-foreground text-sm">{st("subtitle")}</p>
      </header>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <HandoffChat locale={locale} messages={chatMessages} token={token} />
      </NextIntlClientProvider>
    </main>
  )
}

function PublicMessage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="font-semibold text-2xl">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  )
}
