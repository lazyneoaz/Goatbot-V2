module.exports = {
	config: {
		name: "protect",
		version: "1.0",
		author: "YourName",
		countDown: 3,
		role: 1,
		description: "Protect group name, nicknames and photo",
		category: "box chat",
		guide: {
			en: "{pn} on\n{pn} off"
		}
	},

	onStart: async function ({ api, event, message }) {
		global.groupProtect ??= {};

		const threadID = event.threadID;
		const option = event.body
			.trim()
			.split(/\s+/)[1]
			?.toLowerCase();

		if (option === "on") {
			try {
				const info = await api.getThreadInfo(threadID);

				global.groupProtect[threadID] = {
					enabled: true,
					name: info.threadName || "",
					nicknames: info.nicknames || {},
					photo: info.imageSrc || null
				};

				return message.reply(
					"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
					"🔒 𝗣𝗥𝗢𝗧𝗘𝗖𝗧 𝗢𝗡\n" +
					"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
					"🛡️ 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲: ✅\n" +
					"🛡️ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲𝘀: ✅\n" +
					"🛡️ 𝗚𝗿𝗼𝘂𝗽 𝗣𝗵𝗼𝘁𝗼: ✅\n\n" +
					"▬▬▬▬▬▬▬▬▬▬▬▬"
				);
			} catch (error) {
				console.error("protect on:", error);
				return message.reply("❌ ما قدرتش نفعّل الحماية.");
			}
		}

		if (option === "off") {
			delete global.groupProtect[threadID];

			return message.reply(
				"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
				"🔓 𝗣𝗥𝗢𝗧𝗘𝗖𝗧 𝗢𝗙𝗙\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
				"تم إيقاف حماية المجموعة.\n\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬"
			);
		}

		return message.reply(
			"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
			"❌ 𝗨𝗦𝗔𝗚𝗘\n" +
			"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
			"protect on\n" +
			"protect off\n\n" +
			"▬▬▬▬▬▬▬▬▬▬▬▬"
		);
	}
};
