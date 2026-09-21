module.exports = {
	config: {
		name: "exit",
		version: "1.1",
		author: "Ismail",
		countDown: 5,
		role: 1,
		description: "Send an image then leave the group",
		category: "box chat",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ api, event, message }) {
		const IMAGE_URL = "https://postimg.cc/nCktWnfF";

		try {
			// إرسال الصورة فقط بدون أي نص
			const image = await global.utils.getStreamFromURL(IMAGE_URL);

			await message.reply({
				attachment: image
			});

			// انتظار ثانية
			await new Promise(resolve =>
				setTimeout(resolve, 1000)
			);

			// خروج البوت من المجموعة
			return api.removeUserFromGroup(
				api.getCurrentUserID(),
				event.threadID
			);

		} catch (error) {
			console.error("[EXIT ERROR]:", error);

			return message.reply(
				"❌ تعذر تنفيذ أمر الخروج."
			);
		}
	}
};
