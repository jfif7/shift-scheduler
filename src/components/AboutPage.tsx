"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Trash2, PlayCircle, Users, Clock, Presentation } from "lucide-react"
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
      icon: <Users className="w-6 h-6" />,
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
      icon: <Clock className="w-6 h-6" />,
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
      icon: <Presentation className="w-6 h-6" />,
      title: "簡報的例子",
      description: "吉伊卡哇醫院忙碌的一天",

      features: [],
      onLoadDemo: () =>
        handleDemo(DEMO_CHIIKAWA_SCHEDULE, DEMO_CHIIKAWA_SETTINGS),
    },
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{t("page.title")}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("page.description")}
          </p>
        </div>

        {/* Use Cases & Demo Section */}
        <div className="border-t pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">示範案例</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              體驗我們的班表管理系統，選擇以下案例來載入預設的排班情境和設定。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="text-primary">{useCase.icon}</div>
                    {useCase.title}
                  </CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {useCase.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <Button
                      onClick={useCase.onLoadDemo}
                      className="w-full flex items-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      載入{useCase.title}範例
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Management Section */}
        <div className="border-t pt-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {t("dataManagement.title")}
            </h2>
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("dataManagement.clearAllDataDescription")}
              </p>
              <div className="flex justify-center">
                <Button
                  variant="destructive"
                  onClick={onClearAllData}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("dataManagement.clearAllData")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
