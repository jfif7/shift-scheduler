import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "隱私權政策",
  description:
    "班表管理系統的隱私權政策：資料儲存方式、Cookie 與廣告、第三方服務說明。",
}

export default function PrivacyPage() {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">隱私權政策</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        最後更新：2026 年 6 月
      </p>

      <p className="mt-6 leading-8">
        本政策說明班表管理系統（以下稱「本服務」）如何處理你的資料。使用本服務即表示你同意本政策的內容。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">我們收集與儲存的資料</h2>
      <p className="mt-4 leading-8">
        本服務的核心資料為你建立的排班內容，包括員工、限制條件與班表。
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-8">
        <li>
          <strong>未登入時</strong>
          ：所有資料僅儲存在你自己的瀏覽器（localStorage），不會上傳到伺服器。
        </li>
        <li>
          <strong>登入時</strong>：本服務透過 Google 帳號進行身分驗證（Firebase
          Authentication），並將你的排班資料儲存於 Google
          Firestore，以便跨裝置同步。
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">Cookie 與廣告</h2>
      <p className="mt-4 leading-8">
        本網站使用 Google AdSense 顯示廣告。Google 及其合作夥伴會使用
        Cookie，依據你造訪本網站及其他網站的紀錄來放送廣告。你可以前往{" "}
        <a
          href="https://www.google.com/settings/ads"
          className="underline underline-offset-4"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          Google 廣告設定
        </a>
        ，管理或停用個人化廣告。第三方廠商的 Cookie
        使用受其各自的隱私權政策規範，你也可以參考{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          className="underline underline-offset-4"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          Google 的廣告技術說明
        </a>
        。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">第三方服務</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-8">
        <li>Google AdSense（廣告放送）</li>
        <li>Google Firebase／Firestore（登入與資料同步）</li>
        <li>GitHub Pages（網站代管）</li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">資料的使用</h2>
      <p className="mt-4 leading-8">
        我們不會出售你的個人資料。排班資料僅用於提供排班功能，不會用於其他目的。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">兒童隱私</h2>
      <p className="mt-4 leading-8">
        本服務並非針對 13 歲以下兒童設計，亦不會刻意收集兒童的個人資料。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">政策變更</h2>
      <p className="mt-4 leading-8">
        我們可能不時更新本政策，更新後會於本頁公告最新版本與日期。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">聯絡我們</h2>
      <p className="mt-4 leading-8">
        對本政策有任何疑問，歡迎來信：
        <span className="font-medium">email@onino.tw</span>
      </p>
    </article>
  )
}
