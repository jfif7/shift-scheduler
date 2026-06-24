"use client"

import { Button } from "@/components/ui/button"
import {
  Trash2,
  Users,
  Clock,
  Presentation,
  Check,
  ArrowRight,
  CalendarDays,
  Sparkles,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ScheduleSettings, ScheduleItem } from "@/types/schedule"
import {
  DEMO_DOCTOR_SCHEDULE,
  DEMO_DOCTOR_SETTINGS,
} from "@/data/demoDoctorSchedule"
import {
  DEMO_NURSE_SCHEDULE,
  DEMO_NURSE_SETTINGS,
} from "@/data/demoNurseSchedule"
import {
  DEMO_CHIIKAWA_SCHEDULE,
  DEMO_CHIIKAWA_SETTINGS,
} from "@/data/demoChiikawa"

interface AboutPageProps {
  onClearAllData: () => void
  onLoadDemo: (schedule: ScheduleItem, settings: ScheduleSettings) => void
}

export function AboutPage({ onClearAllData, onLoadDemo }: AboutPageProps) {
  const t = useTranslations()

  const handleDemo = (schedule_string: string, setting_string: string) => {
    const data = JSON.parse(schedule_string)
    const schedule: ScheduleItem = {
      ...data,
      createdAt: new Date(data.createdAt),
    }
    onLoadDemo(schedule, JSON.parse(setting_string))
    toast.success(t("demo.loaded"), {
      description: t("demo.loadedDescription"),
    })
  }

  const useCases = [
    {
      icon: Users,
      title: "醫生排班",
      description: "單班制醫生排班，每天需要2名醫生值班，確保醫療服務連續性。",
      features: [
        "每天一個班次兩線，需要2名醫生",
        "最多連續工作1天，班次間至少休息1天，每週最多工作6天",
        "菜鳥/老鳥 標籤：確保同一班次不會出現兩個菜鳥/老鳥",
        "特殊假日班規則：六日連續上班，無視前述休息規則",
      ],
      onLoadDemo: () => handleDemo(DEMO_DOCTOR_SCHEDULE, DEMO_DOCTOR_SETTINGS),
    },
    {
      icon: Clock,
      title: "護理師排班",
      description: "三班制護理師排班，24小時覆蓋，包含早班、晚班和夜班。",
      features: [
        "早班6人、晚班4人、夜班3人的三班制",
        "最多連續工作6天（勞基法）",
        "每週工作2-6個班次",
        "點擊班次圖例可以一鍵調整全部班次條件",
      ],
      onLoadDemo: () => handleDemo(DEMO_NURSE_SCHEDULE, DEMO_NURSE_SETTINGS),
    },
    {
      icon: Presentation,
      title: "簡報的例子",
      description: "吉伊卡哇醫院忙碌的一天",
      features: [],
      onLoadDemo: () =>
        handleDemo(DEMO_CHIIKAWA_SCHEDULE, DEMO_CHIIKAWA_SETTINGS),
    },
  ]

  return (
    <div className="bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="lp-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="size-3.5" />
              CP-SAT · 基因演算法 排班引擎
            </span>

            <h1 className="mt-5 text-pretty text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">
              {t("page.title")}
            </h1>

            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">
              {t("page.description")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="active:translate-y-px">
                <a href="#demos">
                  查看範例
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <a
                href="#data"
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                資料管理
              </a>
            </div>
          </div>

          {/* Real mini-schedule preview (a small live-styled version of the
              product's own calendar, not a mocked screenshot). */}
          <div className="lp-rise" style={{ animationDelay: "120ms" }}>
            <SchedulePreview />
          </div>
        </div>
      </section>

      {/* ── Demo cases ───────────────────────────────────────── */}
      <section
        id="demos"
        className="scroll-mt-20 border-t border-border bg-muted/30"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">示範案例</h2>
            <p className="mt-3 text-muted-foreground">
              體驗我們的班表管理系統，選擇以下案例來載入預設的排班情境和設定。
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {useCases.slice(0, 2).map((useCase) => {
              const Icon = useCase.icon
              return (
                <article
                  key={useCase.title}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-600/30 hover:shadow-md"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    {useCase.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {useCase.description}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {useCase.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-foreground/80"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={useCase.onLoadDemo}
                    size="lg"
                    className="mt-7 w-full active:translate-y-px"
                  >
                    載入{useCase.title}範例
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </article>
              )
            })}

            {/* Wide accent tile — the playful presentation demo */}
            {useCases.slice(2).map((useCase) => {
              const Icon = useCase.icon
              return (
                <article
                  key={useCase.title}
                  className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-emerald-600/20 bg-gradient-to-br from-emerald-600/10 via-card to-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:col-span-2 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">
                        {useCase.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {useCase.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={useCase.onLoadDemo}
                    size="lg"
                    className="w-full shrink-0 active:translate-y-px md:w-auto"
                  >
                    載入{useCase.title}範例
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Data management ──────────────────────────────────── */}
      <section id="data" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {t("dataManagement.title")}
                </h2>
                <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
                  {t("dataManagement.clearAllDataDescription")}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={onClearAllData}
              className="shrink-0 active:translate-y-px"
            >
              <Trash2 className="size-4" />
              {t("dataManagement.clearAllData")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * A small, real rendering of the product's own month calendar — uses the same
 * shift color tokens the live scheduler uses (.shift-0/1/2), so the hero shows
 * the actual UI in miniature rather than a faked screenshot.
 */
function SchedulePreview() {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"]
  // First two cells are leading blanks; days 1–30 carry the three shift bars.
  const days = Array.from({ length: 35 }, (_, i) => {
    const date = i - 1
    return { date: date >= 1 && date <= 30 ? date : null }
  })

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg shadow-emerald-950/5">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-sm font-semibold tracking-tight">
          2025 年 8 月班表
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600/10 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          已生成
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className="aspect-square overflow-hidden rounded-md border border-border/60 bg-background p-0.5"
          >
            {day.date && (
              <>
                <div className="px-0.5 text-[8px] leading-tight text-muted-foreground">
                  {day.date}
                </div>
                <div className="mt-0.5 space-y-[2px]">
                  <div className="h-[3px] rounded-full shift-0" />
                  <div className="h-[3px] rounded-full shift-1" />
                  <div className="h-[3px] rounded-full shift-2" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
