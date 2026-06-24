import type { Metadata } from "next"
import { AdUnit } from "@/components/ads/AdUnit"

export const metadata: Metadata = {
  title: "運作原理",
  description:
    "了解班表管理系統如何運用限制條件與最佳化演算法（Google OR-Tools CP-SAT、模擬退火、基因演算法），自動產生公平的每月醫院班表。",
}

export default function HowItWorksPage() {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">運作原理</h1>

      <p className="mt-6 leading-8">
        班表管理系統是一套專為醫院、診所與各種輪班單位設計的線上排班工具。你只要定義員工、設定排班規則與個人偏好，系統就能在數秒內自動產生一份兼顧公平與人力需求的每月班表，並可一鍵匯出。本頁說明系統背後的運作方式。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">排班為什麼困難</h2>
      <p className="mt-4 leading-8">
        醫院排班看似只是把人填進日曆，實際上是一個高度受限的組合最佳化問題。排班者必須同時兼顧：每個班別都要有足夠人力、每位員工的工時要公平、連續上班與休息時間要符合勞動條件，還要盡量滿足每個人的休假與排班偏好。當員工人數與限制條件增加時，可行的排法數量會以指數成長，人工調整往往得花上好幾天，結果還不一定公平。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">限制條件</h2>
      <p className="mt-4 leading-8">
        系統支援多種可自由開關的限制條件，套用在整份班表的產生過程：
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-8">
        <li>連續上班上限：限制每位員工最多可連續上班的天數，避免過勞。</li>
        <li>休息間隔：兩個班次之間需保留足夠的休息時間。</li>
        <li>每週／每月班數上限：控制每位員工在一段期間內的總班數。</li>
        <li>平日與假日班數：分別設定平日與假日的班數範圍，並盡量讓所有人平均分攤。</li>
        <li>每班人力需求：每個班別、每一天都可獨立設定需要的人數。</li>
        <li>員工標籤：例如「資深」「新進」「假日型」等標籤，讓系統依角色調整安排。</li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">個人偏好</h2>
      <p className="mt-4 leading-8">
        除了全域規則，每位員工都可以針對特定日期或特定班別標記「希望排」或「避免排」。系統會在滿足硬性限制的前提下，盡量符合這些偏好，讓班表更貼近實際需求。
      </p>

      <div className="my-10">
        <AdUnit slot="2129364108" />
      </div>

      <h2 className="mt-10 text-2xl font-semibold">三種排班演算法</h2>
      <p className="mt-4 leading-8">
        為了在不同情境下都能產生高品質的班表，系統內建三種可互換的演算法：
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-8">
        <li>
          <strong>CP-SAT（限制規劃求解器）</strong>：採用 Google OR-Tools 的 CP-SAT
          求解器，是品質最高的方法。它會精確處理所有硬性限制，並在公平性等目標上尋找最佳解，需要連線到排班伺服器。
        </li>
        <li>
          <strong>模擬退火（Simulated Annealing）</strong>：完全在瀏覽器中執行的區域搜尋演算法，適合單一班別的情境，不需要伺服器。
        </li>
        <li>
          <strong>基因演算法（Genetic Algorithm）</strong>：同樣在瀏覽器中執行，透過模擬演化的方式逐步改良班表，適合多班別的情境。
        </li>
      </ul>
      <p className="mt-4 leading-8">
        預設的「自動」模式會先嘗試連線 CP-SAT 伺服器；若無法連線，便自動改用瀏覽器端的演算法——單班別時使用模擬退火，多班別時使用基因演算法。如此一來，即使在離線或伺服器忙碌時，仍能順利產生班表。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">公平性與平衡</h2>
      <p className="mt-4 leading-8">
        產生班表時，系統不只是「填滿」班次，而是會以公平為目標進行最佳化。它會盡量讓每位員工的總班數、平日班與假日班的分配趨於平均，避免有人長期被排到較多假日班或大夜班，降低人工調整時最常見的爭議。
      </p>

      <h2 className="mt-10 text-2xl font-semibold">使用步驟</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-6 leading-8">
        <li>在「員工」面板新增員工，並設定每人的班數範圍與標籤。</li>
        <li>在「設定」與班表上設定限制條件與個人偏好。</li>
        <li>選擇月份後，按一下「產生班表」。</li>
        <li>檢視結果，必要時調整條件重新產生。</li>
        <li>以 CSV 或圖片格式匯出，方便公告或彙整。</li>
      </ol>

      <div className="my-10">
        <AdUnit slot="2129364108" />
      </div>
    </article>
  )
}
