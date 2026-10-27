"use client"

import type { NotifyAgentStepSchema } from "@chatbotx.io/flow-config"
import { Card, CardContent } from "@chatbotx.io/ui/components/ui/card"
import { BellRingIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { BaseStateViewer } from "../../states/viewer"
import { BaseStepViewer } from "../base/viewer"

const NotifyAgentStepViewer = ({ data }: { data: NotifyAgentStepSchema }) => {
  const t = useTranslations()

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        <div className="px-4 py-2">
          <BaseStepViewer
            icon={BellRingIcon}
            title={t("flows.actions.notifyAgent")}
          />
          {data.phoneNumber ? (
            <div className="mt-1 truncate text-muted-foreground text-xs">
              {data.phoneNumber}
            </div>
          ) : null}
        </div>
        <div className="my-2 mr-3 flex flex-col gap-1">
          {data.states.map((state) => (
            <BaseStateViewer data={state} key={state.id} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default NotifyAgentStepViewer
