"use client"

import { InputField } from "@chatbotx.io/ui/components/form/input-field"
import { SwitchField } from "@chatbotx.io/ui/components/form/switch-field"
import { BellRingIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { BaseStepEditor } from "../base/editor"

type NotifyAgentStepEditorProps = {
  parentName: string
}

const NotifyAgentStepEditor = (props: NotifyAgentStepEditorProps) => {
  const { parentName } = props
  const t = useTranslations()

  return (
    <BaseStepEditor icon={BellRingIcon} title={t("flows.actions.notifyAgent")}>
      <div className="flex flex-col gap-4">
        <InputField
          description={t("flows.notifyAgent.phoneNumberDescription")}
          label={t("flows.notifyAgent.phoneNumber")}
          name={`${parentName}.phoneNumber`}
          placeholder="+573001234567"
          required
        />
        <InputField
          description={t("flows.notifyAgent.templateNameDescription")}
          label={t("flows.notifyAgent.templateName")}
          name={`${parentName}.templateName`}
        />
        <InputField
          label={t("flows.notifyAgent.templateLanguage")}
          name={`${parentName}.templateLanguage`}
          required
        />
        <SwitchField
          label={t("flows.notifyAgent.disableBot")}
          name={`${parentName}.disableBot`}
        />
      </div>
    </BaseStepEditor>
  )
}

export default NotifyAgentStepEditor
