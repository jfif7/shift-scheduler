---
name: run-app
description: Launch the Shift Scheduler frontend + CP-SAT server in this sandbox and drive a headless browser to screenshot it. Use when asked to run the app, see what it looks like, screenshot it, or verify a UI/scheduling change works end-to-end.
---

# Running the Shift Scheduler app

Two processes plus a headless browser. The sandbox has two traps that the
obvious commands hit — follow the exact launch lines below.

## Sandbox gotchas (why the obvious commands fail)

- **`npm run dev` dies instantly** (exit 144 / SIGSTKFLT, no output). The
  script is `next dev --turbopack`; turbopack gets killed by the sandbox.
  Launch **`npx next dev`** (no turbopack) instead — it works.
- **`python main.py` fails with `EADDRINUSE` on `0.0.0.0:8211`.** Port 8211
  is sandbox-reserved and the `0.0.0.0` bind is rejected. Run uvicorn bound
  to **`127.0.0.1` on a free high port (8222)** instead.
- **`curl http://localhost:3000` hangs** when nothing is serving (sandbox
  intercepts the closed port). When a server *is* up, curl returns normally —
  so a hanging curl means "not up yet", not "broken".
- Use the Bash tool's **`run_in_background: true`** for `next dev` — a tracked
  background task survives across tool calls; plain `&`/`setsid` get reaped.

## 1. Start the CP-SAT server (Python)

```bash
cd server
source /home/qq/.local/miniconda3/etc/profile.d/conda.sh
conda activate scheduler
( python -m uvicorn main:app --host 127.0.0.1 --port 8222 --log-level info \
    > /tmp/server.log 2>&1 & echo $! > /tmp/server.pid )
sleep 5
curl -s http://127.0.0.1:8222/health   # -> {"status":"healthy",...}
```

Skip this step if you only need the static UI — the frontend falls back to a
local genetic/simulated-annealing solver when the server is unreachable (the
CP-SAT badge then shows "Offline" instead of "Connected").

## 2. Start the frontend, pointed at the local server

`.env.development` hardcodes `NEXT_PUBLIC_SCHEDULER_API_URL` to the deployed
Cloud Run URL. Override it so the browser talks to your local server:

Run this with the Bash tool's `run_in_background: true`:

```bash
NEXT_PUBLIC_SCHEDULER_API_URL=http://localhost:8222 npx next dev
```

Then poll until it serves (first compile takes ~12s):

```bash
timeout 60 bash -c 'until curl -sf http://localhost:3000 >/dev/null 2>&1; do sleep 2; done' && echo UP
```

## 3. Install a headless browser (once per machine)

`chromium-cli`/Playwright aren't preinstalled. The headless shell caches in
`~/.cache/ms-playwright`, so this is a one-time ~114 MB download:

```bash
npm install --no-save playwright-core     # --no-save keeps package.json clean
npx playwright-core install chromium
```

## 4. Drive it and screenshot

Write the driver **inside the repo root** (so `playwright-core` resolves) and
run with `node`. The executable is the headless-shell, not full chromium:

```js
// drive.mjs  (delete when done)
import { chromium } from 'playwright-core'
import { readdirSync } from 'fs'
const base = `${process.env.HOME}/.cache/ms-playwright`
const dir = readdirSync(base).find((d) => d.startsWith('chromium_headless_shell'))
const exe = `${base}/${dir}/chrome-headless-shell-linux64/chrome-headless-shell`
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-gpu'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 })
await page.getByText('載入護理師排班範例').click()      // load 3-shift nurse demo
await page.waitForTimeout(1500)
await page.getByText('班表生成').first().click()        // schedule-generation tab
await page.waitForTimeout(3000)                          // let CP-SAT status probe settle
await page.getByRole('button', { name: /生成班表/ }).first().click()  // generate
await page.waitForTimeout(8000)
await page.screenshot({ path: '/tmp/after-gen.png', fullPage: true })
console.log('CONSOLE_ERRORS:', errors.length)
await browser.close()
```

```bash
node drive.mjs            # then Read /tmp/after-gen.png
```

Save screenshots under the session scratchpad and **Read them** — a blank
frame means the page didn't render. After a CP-SAT generation, every calendar
cell fills with employee names and `server.log` shows
`status=OPTIMAL, solve_time=...`. Check `CONSOLE_ERRORS: 0` before declaring success.

UI is zh-TW: 班表生成 = Schedule tab, 條件設置 = Settings, 生成班表 = Generate,
白班/小夜/大夜 = day/evening/night shifts.

## 5. Clean up

```bash
pkill -f "next dev"; pkill -f "next-server"
kill "$(cat /tmp/server.pid)" 2>/dev/null
rm -f drive.mjs
```
