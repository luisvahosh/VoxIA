import { resolveLocale } from "@/i18n/config"
import { messagesByLocale } from "@/i18n/messages"
import type en from "../../messages/en.json"

export function loadWorkspaceMessages(language: string) {
  const locale = resolveLocale(language)
  // Every locale carries every key (i18n:check), so the English shape types
  // `createTranslator` calls made with these messages.
  return { locale, messages: messagesByLocale[locale] as typeof en }
}
