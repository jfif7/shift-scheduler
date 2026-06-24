import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "關於",
  description:
    "班表管理系統是一套免費的線上醫院人力排班工具，協助醫療與輪班單位快速產生公平的每月班表。",
}

export default function AboutPage() {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">關於</h1>

      <p className="mt-6 leading-8">
        班表管理系統是一套免費的線上醫院人力排班工具，目標是把原本耗時又容易引發爭議的人工排班，變成幾秒鐘就能完成的事。
      </p>

      <p className="mt-4 leading-8">
        它的設計對象是需要每月排班的醫療與輪班單位——病房護理長、診所管理者，以及任何必須在公平、休息規定與人力需求之間取得平衡的排班者。
      </p>

      <p className="mt-4 leading-8">
        系統結合了業界常用的最佳化技術（Google OR-Tools 的 CP-SAT 求解器）與瀏覽器端演算法，讓使用者不需要任何專業背景，就能產生高品質、可匯出的班表。想進一步了解運作方式，請參考
        <a href="/how-it-works" className="underline underline-offset-4">運作原理</a>。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">聯絡我們</h2>
      <p className="mt-4 leading-8">
        如有任何問題、建議或合作需求，歡迎來信：
        {/* TODO: 填入正式聯絡 Email */}
        <span className="font-medium">［請填入聯絡 Email］</span>
      </p>
    </article>
  )
}
