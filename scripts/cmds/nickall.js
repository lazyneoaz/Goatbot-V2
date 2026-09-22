module.exports = {
	config: {
		name: "nickall",
		version: "1.0",
		author: "YourName",
		countDown: 5,
		role: 1,
		description: "Set the same nickname for all group members",
		category: "box chat",
		guide: {
			en: "{pn} <nickname>"
		}
	},

	onStart: async function ({ api, event, message }) {
		const nickname = event.body
			.replace(/^\S+\s*/, "")
			.trim();

		if (!nickname) {
			return message.reply(
				"❌ الاستعمال الصحيح:\n" +
				"nickall <الكنية>\n\n" +
				"مثال:\n" +
				"nickall X69X"
			);
		}

		try {
			const info = await api.getThreadInfo(event.threadID);
			const members = info.participantIDs || [];

			if (!members.length) {
				return message.reply("❌ ما لقيتش أعضاء فالمجموعة.");
			}

			let success = 0;
			let failed = 0;

			for (const userID of members) {
				try {
					await api.changeNickname(
						nickname,
						event.threadID,
						userID
					);

					success++;

					// تأخير بسيط بين الطلبات
					await new Promise(resolve =>
						setTimeout(resolve, 300)
					);
				} catch (error) {
					failed++;
				}
			}

			return message.reply(
				`✅ تم تغيير الكنية للجميع.\n\n` +
				`🏷️ الكنية: ${nickname}\n` +
				`👥 الأعضاء: ${members.length}\n` +
				`✔️ نجح: ${success}\n` +
				`❌ فشل: ${failed}`
			);

		} catch (error) {
			console.error("nickall error:", error);

			return message.reply(
				"❌ وقع خطأ أثناء تغيير الكنيات.\n" +
				"تأكد أن البوت عنده الصلاحيات اللازمة."
			);
		}
	}
};
