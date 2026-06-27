/**
 * Taiwan Labor Standards Act (勞動基準法) day-based working-time regimes.
 *
 * This mirrors the authoritative table in
 * `server/services/cp_sat_solver.py` (LABOR_REGIMES). The CP-SAT solver is the
 * source of truth and ENFORCES these as hard constraints; the helpers here only
 * power instant client-side warnings before a schedule is generated.
 *
 * Only DAY-based rules are modeled. Hour-based rules — §34 (11h inter-shift
 * rest) and §30/§32 (daily/weekly hours, overtime) — cannot be expressed in a
 * shift-count model and remain the operator's responsibility.
 */

import { ScheduleSettings } from "@/types/schedule"

export type LaborRegime = "none" | "standard" | "four_week_flexible"

export const LABOR_REGIMES: LaborRegime[] = [
  "none",
  "standard",
  "four_week_flexible",
]

/** Rolling-window day-off floors: in every window of `windowDays` consecutive
 *  days an employee must have at least `minOffDays` days off. */
export const LABOR_REGIME_WINDOWS: Record<
  Exclude<LaborRegime, "none">,
  { windowDays: number; minOffDays: number }[]
> = {
  standard: [{ windowDays: 7, minOffDays: 2 }],
  four_week_flexible: [
    { windowDays: 14, minOffDays: 2 },
    { windowDays: 28, minOffDays: 8 },
  ],
}

/** Longest legal consecutive-work run implied by a regime, or null for "none". */
export const regimeMaxConsecutiveDays = (regime: LaborRegime): number | null => {
  if (regime === "none") return null
  const windows = LABOR_REGIME_WINDOWS[regime]
  return Math.min(...windows.map((w) => w.windowDays - w.minOffDays))
}

export interface ComplianceWarning {
  /** Translation key + interpolation values so the UI can localize. */
  key: string
  values?: Record<string, string | number>
}

/**
 * Advisory warnings when the user's settings are looser than the chosen regime.
 * The solver still enforces the regime regardless; these just flag what will be
 * tightened. Returns [] when no regime is selected.
 */
export const checkCompliance = (
  settings: ScheduleSettings
): ComplianceWarning[] => {
  const regime = settings.laborRegime ?? "none"
  if (regime === "none") return []

  const warnings: ComplianceWarning[] = []

  const ceiling = regimeMaxConsecutiveDays(regime)
  if (ceiling !== null && settings.maxConsecutiveDays > ceiling) {
    warnings.push({
      key: "labor.warnConsecutiveDays",
      values: { value: settings.maxConsecutiveDays, ceiling },
    })
  }

  // standard = 一例一休 needs >=2 days off per 7 (<=5 worked); a higher weekly
  // cap will simply be tightened by the solver.
  if (regime === "standard" && settings.maxShiftsPerWeek > 5) {
    warnings.push({
      key: "labor.warnMaxShiftsPerWeek",
      values: { value: settings.maxShiftsPerWeek },
    })
  }

  return warnings
}
