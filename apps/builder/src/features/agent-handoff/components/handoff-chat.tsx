"use client"

import { Button } from "@chatbotx.io/ui/components/ui/button"
import { Textarea } from "@chatbotx.io/ui/components/ui/textarea"
import { cn } from "@chatbotx.io/ui/lib/utils"
import { Loader2Icon, SendIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  returnHandoffToBotAction,
  sendHandoffReplyAction,
} from "@/app/handoff/actions"

const REFRESH_INTERVAL_MS = 8000

export type HandoffChatMessage = {
  id: string
  text: string | null
  senderType: string
  createdAt: string
  hasAttachment: boolean
}

const senderLabelKeyByType = {
  contact: "contactLabel",
  bot: "botLabel",
} as const satisfies Record<string, string>

function isLabelledSender(
  senderType: string,
): senderType is keyof typeof senderLabelKeyByType {
  return senderType in senderLabelKeyByType
}

export function HandoffChat({
  token,
  locale,
  messages,
}: {
  token: string
  locale: string
  messages: HandoffChatMessage[]
}) {
  const t = useTranslations("agentHandoff")
  const router = useRouter()
  const [text, setText] = useState("")
  const [confirmingReturn, setConfirmingReturn] = useState(false)

  // New customer messages arrive by webhook; re-render the server page.
  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), REFRESH_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [router])

  const { execute: send, isPending: isSending } = useAction(
    sendHandoffReplyAction,
    {
      onSuccess: () => {
        setText("")
        router.refresh()
      },
      onError: () => toast.error(t("sendError")),
    },
  )
  const { execute: returnToBot, isPending: isReturning } = useAction(
    returnHandoffToBotAction,
    { onSuccess: () => router.refresh() },
  )

  const timeFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-2 rounded-md border bg-muted/30 p-3">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">
            {t("empty")}
          </p>
        ) : (
          messages.map((message) => {
            const fromContact = message.senderType === "contact"
            const label = isLabelledSender(message.senderType)
              ? t(senderLabelKeyByType[message.senderType])
              : t("agentLabel")
            return (
              <div
                className={cn(
                  "flex max-w-[85%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                  fromContact
                    ? "self-start bg-background"
                    : "self-end bg-primary text-primary-foreground",
                )}
                key={message.id}
              >
                <span className="font-medium text-xs opacity-80">
                  {label} · {timeFormat.format(new Date(message.createdAt))}
                </span>
                <span className="whitespace-pre-wrap break-words">
                  {message.text ??
                    (message.hasAttachment ? t("attachment") : "")}
                </span>
              </div>
            )
          })
        )}
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (text.trim()) {
            send({ token, text })
          }
        }}
      >
        <Textarea
          disabled={isSending}
          maxLength={1000}
          onChange={(event) => setText(event.target.value)}
          placeholder={t("placeholder")}
          rows={3}
          value={text}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            {confirmingReturn ? (
              <p className="max-w-xs text-muted-foreground text-xs">
                {t("returnConfirm")}
              </p>
            ) : null}
            <Button
              disabled={isReturning}
              onClick={() => {
                if (confirmingReturn) {
                  returnToBot({ token })
                } else {
                  setConfirmingReturn(true)
                }
              }}
              type="button"
              variant={confirmingReturn ? "destructive" : "outline"}
            >
              {isReturning ? <Loader2Icon className="animate-spin" /> : null}
              {t("returnToBot")}
            </Button>
          </div>
          <Button disabled={isSending || !text.trim()} type="submit">
            {isSending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SendIcon />
            )}
            {t("send")}
          </Button>
        </div>
      </form>
    </div>
  )
}
