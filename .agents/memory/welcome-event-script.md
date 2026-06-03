---
name: Welcome event script
description: The welcome.js event script was missing — language file and setwelcome.js command existed but the sender was absent.
---

## Rule
`scripts/events/welcome.js` must exist for the "Thanks for inviting me" message to fire when the bot is added to a group, and for per-group welcome messages (configured via `setwelcome`) to fire when members join.

**Why:** The language file (`languages/events/en.js`) had full `welcome.text.*` strings and `scripts/cmds/setwelcome.js` let admins configure messages, but there was no event script to actually send them. The bot silently skipped the whole feature.

**How to apply:** If the welcome feature is ever reported broken again, check `scripts/events/welcome.js` exists and has correct `onStart` returning an async function on `log:subscribe`.

## Key implementation details
- Uses `global.utils.getPrefix(threadID)` — NOT `client.getPrefix()` (client does not have that method)
- When BOT is added: always sends `getLang("welcomeMessage", prefix)` regardless of settings
- When MEMBERS join: checks `threadData.settings.sendWelcomeMessage` before sending
- Supports `{userName}`, `{userNameTag}`, `{multiple}`, `{boxName}`, `{threadName}`, `{session}` template vars
- Supports file attachments stored in `threadData.data.welcomeAttachment`
