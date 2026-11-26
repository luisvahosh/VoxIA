import { CalendarCheckIcon, MessageCircleIcon, UsersIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { getTenantSettings } from "@/features/tenant/utils"

const brandPoints = [
  { key: "brandPanel.point1", Icon: MessageCircleIcon },
  { key: "brandPanel.point2", Icon: CalendarCheckIcon },
  { key: "brandPanel.point3", Icon: UsersIcon },
] as const

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("auth")
  const { name, logoLightUrl } = await getTenantSettings()

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel: desktop only, the form header carries the logo on phones. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-tevari-ciruela p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-40 -top-40 size-[30rem] rounded-full border-[3.5rem] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-24 -bottom-24 size-72 rounded-full bg-tevari-rosa/25 blur-3xl"
        />

        {/* biome-ignore lint/performance/noImgElement: tenant logo URL, may be an SVG on another origin */}
        <img
          alt={name}
          className="relative h-12 w-auto self-start"
          height={48}
          src={logoLightUrl}
          width={137}
        />

        <div className="relative max-w-md space-y-8">
          <div className="space-y-3">
            <p className="font-semibold text-sm text-tevari-arena uppercase tracking-widest">
              {t("brandPanel.eyebrow")}
            </p>
            <h2 className="font-semibold text-3xl leading-tight">
              {t("brandPanel.headline")}
            </h2>
            <p className="text-base text-white/75">
              {t("brandPanel.subtitle")}
            </p>
          </div>

          <ul className="space-y-4">
            {brandPoints.map(({ key, Icon }) => (
              <li className="flex items-center gap-3" key={key}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-sm">
                  <Icon className="size-5 text-tevari-arena" />
                </span>
                <span className="text-sm text-white/90">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-white/50 text-xs">{name}</p>
      </aside>

      <main className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      </main>

      <div className="fixed inset-e-2 bottom-2">
        <ThemeSwitcher />
      </div>
    </div>
  )
}
