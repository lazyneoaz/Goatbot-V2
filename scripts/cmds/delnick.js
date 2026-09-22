module.exports = {
	config: {
		name: "delnick",
		version: "1.0",
		author: "YourName",
		countDown: 5,
		role: 1,
		description: "Remove nicknames from all group members",
		category: "box chat",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ api, event, message }) {
		try {
			const threadInfo = await api.getThreadInfo(event.threadID);
			const participants = threadInfo.participantIDs || [];

			if (participants.length === 0) {
				return message.reply("❌ ما لقيتش أعضاء فالمجموعة.");
			}

			let success = 0;
			let failed = 0;

			for (const userID of participants) {
				try {
					await api.changeNickname("", event.threadID, userID);
					success++;

					// تأخير بسيط لتفادي إرسال طلبات كثيرة دفعة واحدة
					await new Promise(resolve => setTimeout(resolve, 300));
				} catch (error) {
					failed++;
				}
			}

			return message.reply(
				`✅ تم حذف الكنيات.\n\n` +
				`👥 عدد الأعضاء: ${participants.length}\n` +
				`✔️ تم بنجاح: ${success}\n` +
				`❌ فشل: ${failed}`
			);

		} catch (error) {
			console.error("delnick error:", error);

			return message.reply(
				"❌ وقع خطأ أثناء حذف الكنيات.\n" +
				"تأكد أن البوت عنده الصلاحيات اللازمة."
			);
		}
	}
};
