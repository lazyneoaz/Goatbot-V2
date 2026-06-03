const { db, utils, GoatBot } = global;
const { config } = GoatBot;
const { log, getText } = utils;
const { creatingThreadData, creatingUserData } = global.client.database;

module.exports = async function (usersData, threadsData, event) {
        const { threadID } = event;
        const senderID = event.senderID || event.author || event.userID;

        // ———————————— CHECK THREAD DATA ———————————— //
        if (threadID) {
                try {
                        // createThreadDataError is a Map<threadID, timestamp> — expires after 5 min
                        const errTime = global.temp.createThreadDataError.get(threadID);
                        if (errTime) {
                                if (Date.now() - errTime < 5 * 60 * 1000) return;
                                global.temp.createThreadDataError.delete(threadID); // expired, retry allowed
                        }

                        const findInCreatingThreadData = creatingThreadData.find(t => t.threadID == threadID);
                        if (!findInCreatingThreadData) {
                                if (global.db.allThreadData.some(t => t.threadID == threadID))
                                        return;

                                const threadData = await threadsData.create(threadID);
                                log.info("DATABASE", `New Thread: ${threadID} | ${threadData.threadName} | ${config.database.type}`);
                        }
                        else {
                                await findInCreatingThreadData.promise;
                        }
                }
                catch (err) {
                        if (err.name != "DATA_ALREADY_EXISTS") {
                                global.temp.createThreadDataError.set(threadID, Date.now());
                                log.err("DATABASE", getText("handlerCheckData", "cantCreateThread", threadID), err);
                        }
                }
        }


        // ————————————— CHECK USER DATA ————————————— //
        if (senderID) {
                try {
                        const findInCreatingUserData = creatingUserData.find(u => u.userID == senderID);
                        if (!findInCreatingUserData) {
                                if (db.allUserData.some(u => u.userID == senderID))
                                        return;

                                const userData = await usersData.create(senderID);
                                log.info("DATABASE", `New User: ${senderID} | ${userData.name} | ${config.database.type}`);
                        }
                        else {
                                await findInCreatingUserData.promise;
                        }
                }
                catch (err) {
                        if (err.name != "DATA_ALREADY_EXISTS")
                                log.err("DATABASE", getText("handlerCheckData", "cantCreateUser", senderID), err);
                }
        }
};