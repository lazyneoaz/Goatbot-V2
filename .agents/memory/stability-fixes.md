---
name: Stability fixes applied
description: The 13 bugs fixed to make the bot stable for long-running deployments (Render, Replit, etc.)
---

## Root cause of Render 24h "restart" (bot dying)
- `uncaughtException` → `process.exit(1)` → child exits → old `index.js` only restarted on code 2 → bot permanently dead while parent lived
- Fix: `index.js` now restarts on ANY non-zero exit code (code 2 = instant, others = 3s delay)

## Key architectural insights
- `global.client` does NOT have `getPrefix` — use `global.utils.getPrefix(threadID)`
- `loadScripts.js` does NOT clear require cache on reconnect — module top-level code runs once only
- `createThreadDataError` was a `Set` (entries never expired) → converted to `Map<threadID, timestamp>` with 5-min TTL
- `gracefulShutdown.js` had duplicate `uncaughtException`/`unhandledRejection` registrations — Goat.js already handles these

## Files modified
1. `index.js` — restart on any non-zero exit
2. `Goat.js` — fs.statSync try/catch in finally + createThreadDataError Map
3. `bot/handler/handlerCheckData.js` — TTL Map expiry check
4. `bot/handler/handlerAction.js` — safeCall() wraps all event handlers individually
5. `func/gracefulShutdown.js` — removed duplicate process event registrations
6. `func/analyticsBatcher.js` — delete retryCount key when maxRetries exceeded
7. `func/cooldownManager.js` — _checkMaxEntries() calls _cleanup() instead of O(N log N) sort
8. `func/messageQueue.js` — pendingRetries counter caps rate-limit timers at 50
9. `dashboard/app.js` — hourly MemoryStore session cleanup + async writeFile
10. `dashboard/routes/api.js` — empty catch now logs the error
11. `bot/login/login.js` — account.txt min-length guard + 2FA TTY check + stopListening 5s timeout

## Files created
12. `scripts/events/welcome.js` — was completely missing (language strings + setwelcome.js existed but no sender)

## Files bug-fixed (non-stability)
13. `scripts/events/checkwarn.js` — variable shadowing in find() + client.getPrefix → global.utils.getPrefix
