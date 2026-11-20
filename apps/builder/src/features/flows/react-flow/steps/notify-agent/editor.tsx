"use client"

import { notifyAgentModes } from "@chatbotx.io/flow-config"
import { InputField } from "@chatbotx.io/ui/components/form/input-field"
import { SelectField } from "@chatbotx.io/ui/components/form/select-field"
import { SwitchField } from "@chatbotx.io/ui/components/form/switch-field"
import { BellRingIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"
import { BaseStepEditor } from "../base/editor"

type NotifyAgentStepEditorProps = {
  parentName: string
}

const NotifyAgentStepEditor = (props: NotifyAgentStepEditorProps) => {
  const { parentName } = props
  const t = useTranslations()
  const { control } = useFormContext()
  const mode = useWatch({ name: `${parentName}.mode`, control })
  const isAppointmentNotice = mode === notifyAgentModes.enum.appointment

  const modeOptions = [
    {
      label: t("flows.notifyAgent.modes.handoff"),
      value: notifyAgentModes.enum.handoff,
    },
    {
      label: t("flows.notifyAgent.modes.appointment"),
      value: notifyAgentModes.enum.appointment,
    },
  ]

  return (
    <BaseStepEditor icon={BellRingIcon} title={t("flows.actions.notifyAgent")}>
      <div className="flex flex-col gap-4">
        <SelectField
          description={t("flows.notifyAgent.modeDescription")}
          label={t("flows.notifyAgent.mode")}
          name={`${parentName}.mode`}
          options={modeOptions}
        />
        <InputField
          description={
            isAppointmentNotice
              ? t("flows.notifyAgent.appointmentPhoneNumberDescription")
              : t("flows.notifyAgent.phoneNumberDescription")
          }
          label={t("flows.notifyAgent.phoneNumber")}
          name={`${parentName}.phoneNumber`}
          placeholder="+573001234567"
          required
        />
        <InputField
          description={
            isAppointmentNotice
              ? t("flows.notifyAgent.appointmentTemplateNameDescription")
              : t("flows.notifyAgent.templateNameDescription")
          }
          label={t("flows.notifyAgent.templateName")}
          name={`${parentName}.templateName`}
        />
        <InputField
          label={t("flows.notifyAgent.templateLanguage")}
          name={`${parentName}.templateLanguage`}
          required
        />
        {isAppointmentNotice ? null : (
          <SwitchField
            label={t("flows.notifyAgent.disableBot")}
            name={`${parentName}.disableBot`}
          />
        )}
      </div>
    </BaseStepEditor>
  )
}

export default NotifyAgentStepEditor
