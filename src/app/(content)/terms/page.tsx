import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "使用條款",
  description: "班表管理系統的使用條款：服務說明、現狀提供、責任限制與準據法。",
}

export default function TermsPage() {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">使用條款</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        最後更新：2026 年 6 月
      </p>

      <p className="mt-6 leading-8">
        使用班表管理系統（以下稱「本服務」）即表示你同意以下條款。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">服務說明</h2>
      <p className="mt-4 leading-8">
        本服務免費提供線上排班工具，協助使用者產生並匯出班表。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">「現狀」提供</h2>
      <p className="mt-4 leading-8">
        本服務依「現狀」提供，不保證產生的班表完全符合所有法規或實際營運需求。使用者應自行檢視排班結果，並為最終的排班決策負責。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">可接受的使用</h2>
      <p className="mt-4 leading-8">
        你同意不將本服務用於任何非法用途，亦不從事干擾或破壞服務正常運作的行為。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">智慧財產權</h2>
      <p className="mt-4 leading-8">
        本服務的程式、介面與內容之相關權利歸開發者所有。你所建立的排班資料則屬於你自己。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">責任限制</h2>
      <p className="mt-4 leading-8">
        在法律允許的最大範圍內，對於使用或無法使用本服務所造成的任何直接或間接損失，我們不負賠償責任。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">條款變更</h2>
      <p className="mt-4 leading-8">
        我們可能不時修改本條款，修改後會於本頁公告。持續使用本服務即表示接受修改後的條款。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">準據法</h2>
      <p className="mt-4 leading-8">本條款以中華民國法律為準據法。</p>

      <h2 className="mt-10 text-2xl font-semibold">聯絡我們</h2>
      <p className="mt-4 leading-8">
        對本條款有任何疑問，歡迎來信：
        <span className="font-medium">email@onino.tw</span>
      </p>
    </article>
  )
}
