---
name: Event script conventions
description: How event scripts work, getPrefix usage, and the intentional onEvent.js stale-reference pattern.
---

## getPrefix
- `getPrefix` lives at `global.utils.getPrefix(threadID)`, NOT on `global.client`
- `global.client` only has: dirConfig, dirConfigCommands, dirAccount, countDown, cache, database, commandBanned
- Event scripts receive `prefix` (pre-computed string) in their parameters — use that when available
- If you need to compute prefix for a different threadID, call `global.utils.getPrefix(threadID)`

## onEvent.js stale reference — intentional
`onEvent.js` captures `global.GoatBot.onEvent` at module load time:
```js
const allOnEvent = global.GoatBot.onEvent;
```
On bot reconnect, `global.GoatBot.onEvent` is reassigned to `[]`. The stale reference in `onEvent.js` is actually correct because:
- Commands like `warn.js` and `badwords.js` push handler *objects* to GoatBot.onEvent at module top-level (execute-once)
- Those objects are only in the FIRST array captured at load time
- `onEvent.js` processes these objects; `handlerEvents.js` processes string command names from the new array
- Both work correctly in parallel

**Why:** Do NOT "fix" the stale reference — doing so would break warn/badwords event handlers on reconnect.

## Pattern for event scripts
```js
onStart: async ({ threadsData, message, event, api, getLang, prefix }) => {
    if (event.logMessageType !== "log:subscribe") return;
    return async function () {
        // actual logic here
    };
}
```
`handlerEvent()` in `handlerEvents.js` calls `onStart`, and if it returns a function, calls that function.

## checkwarn.js bug (fixed)
Original had variable shadowing: `warnList.find(user => user.userID == user.userID)` — always true.
Fixed to: `warnList.find(warnEntry => warnEntry.userID == user.userFbId)`
