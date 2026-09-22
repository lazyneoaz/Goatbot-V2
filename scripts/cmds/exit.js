module.exports = {
	config: {
		name: "exit",
		version: "1.0",
		author: "Ismail",
		countDown: 3,
		role: 1,
		description: {
			en: "Make the bot leave the group"
		},
		category: "box chat",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ api, event, message }) {
		try {
			// رسالة عادية فقط، بدون attachment
			await message.reply(
				"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
				"👋 𝗚𝗢𝗢𝗗𝗕𝗬𝗘\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
				"🚀 Goodbye everyone.\n" +
				"😙 Ismail Bot is leaving the group💋.\n\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬"
			);

			// خروج البوت من المجموعة
			await new Promise(resolve =>
				setTimeout(resolve, 1000)
			);

			return api.removeUserFromGroup(
				event.threadID,
				api.getCurrentUserID()
			);

		} catch (error) {
			console.error(
				"[EXIT ERROR]",
				error
			);

			return message.reply(
				"❌ حدث خطأ أثناء محاولة خروج البوت."
			);
		}
	}
};
