const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");
const { log } = global.utils;

function safeCall(fn, label) {
        try {
                const result = fn();
                if (result && typeof result.catch === 'function')
                        result.catch(e => log.err('HANDLER', `[${label}] async error:`, e.message || e));
        } catch (e) {
                log.err('HANDLER', `[${label}] error:`, e.message || e);
        }
}

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
        const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

        return async function (event) {
                try {
                        // Check if the bot is in the inbox and anti inbox is enabled
                        if (
                                global.GoatBot.config.antiInbox == true &&
                                (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
                                (event.senderID || event.userID || event.isGroup == false)
                        )
                                return;

                        const message = createFuncMessage(api, event);

                        await handlerCheckDB(usersData, threadsData, event);
                        const handlerChat = await handlerEvents(event, message);
                        if (!handlerChat)
                                return;

                        const {
                                onAnyEvent, onFirstChat, onStart, onChat,
                                onReply, onEvent, handlerEvent, onReaction,
                                typ, presence, read_receipt
                        } = handlerChat;

                        safeCall(onAnyEvent, 'onAnyEvent');
                        switch (event.type) {
                                case "message":
                                case "message_reply":
                                case "message_unsend":
                                        safeCall(onFirstChat, 'onFirstChat');
                                        safeCall(onChat, 'onChat');
                                        safeCall(onStart, 'onStart');
                                        safeCall(onReply, 'onReply');
                                        break;
                                case "event":
                                        safeCall(handlerEvent, 'handlerEvent');
                                        safeCall(onEvent, 'onEvent');
                                        break;
                                case "message_reaction":
                                        safeCall(onReaction, 'onReaction');
                                        break;
                                case "typ":
                                        safeCall(typ, 'typ');
                                        break;
                                case "presence":
                                        safeCall(presence, 'presence');
                                        break;
                                case "read_receipt":
                                        safeCall(read_receipt, 'read_receipt');
                                        break;
                                default:
                                        break;
                        }
                } catch (e) {
                        log.err('HANDLER', 'Unhandled error in event handler:', e.message || e);
                }
        };
};