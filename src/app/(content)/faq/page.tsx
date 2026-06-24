import type { Metadata } from "next"
import { AdUnit } from "@/components/ads/AdUnit"

export const metadata: Metadata = {
  title: "常見問題",
  description:
    "關於班表管理系統的常見問題：是否免費、資料如何儲存、支援的班別與匯出格式、排班公平性等。",
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "這個服務是免費的嗎？",
    a: "是的，班表管理系統可免費使用，產生與匯出班表都不收費。",
  },
  {
    q: "我的資料儲存在哪裡？",
    a: "未登入時，所有資料只儲存在你自己的瀏覽器（localStorage），不會上傳到任何伺服器。使用 Google 帳號登入後，資料會儲存在 Google Firestore，讓你能跨裝置同步。",
  },
  {
    q: "一定要註冊帳號嗎？",
    a: "不需要。你可以完全匿名使用；登入只是為了跨裝置保存與同步資料。",
  },
  {
    q: "可以設定幾種班別？",
    a: "系統支援多種班別與每日多班次，並可為每個班別、每一天分別設定需要的人數。",
  },
  {
    q: "產生一份班表要多久？",
    a: "多數情況下只需數秒。實際時間取決於員工人數、限制條件的複雜度，以及使用的演算法。",
  },
  {
    q: "可以指定某人某天休假嗎？",
    a: "可以。在班表上點選日期，即可為員工標記「希望排」或「避免排」，系統會在符合硬性限制的前提下盡量配合。",
  },
  {
    q: "系統會讓假日班公平嗎？",
    a: "會。公平性是最佳化的核心目標之一，系統會盡量平均分配每位員工的平日班與假日班。",
  },
  {
    q: "可以匯出嗎？支援哪些格式？",
    a: "可以匯出為 CSV 檔或圖片，方便公告或彙整到其他系統。",
  },
  {
    q: "支援哪些語言？",
    a: "介面提供繁體中文與英文，可隨時切換。",
  },
  {
    q: "適合哪些單位使用？",
    a: "特別適合醫院、診所、護理站等需要輪班，且重視公平與人力需求的單位。",
  },
]

export default function FaqPage() {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">常見問題</h1>
      <p className="mt-6 leading-8">
        以下整理使用班表管理系統時最常見的問題。若仍有疑問，歡迎透過
        <a href="/about" className="underline underline-offset-4">關於頁面</a>
        的方式與我們聯絡。
      </p>

      <div className="mt-8 space-y-8">
        {FAQS.map((item) => (
          <section key={item.q}>
            <h2 className="text-xl font-semibold">{item.q}</h2>
            <p className="mt-2 leading-8">{item.a}</p>
          </section>
        ))}
      </div>

      <div className="my-10">
        {/* TODO: replace slot with a real ad-unit id from the AdSense dashboard */}
        <AdUnit slot="0000000000" />
      </div>
    </article>
  )
}
