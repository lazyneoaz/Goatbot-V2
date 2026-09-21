const axios = require("axios");
const { getStreamFromURL } = global.utils;

const IMAGE_PAGES = [
	"https://postimg.cc/WFjnxcv2",
	"https://postimg.cc/Z9N71Lvn",
	"https://postimg.cc/HVT26gtj",
	"https://postimg.cc/BX5zvpmz"
];

async function getDirectImageURL(pageURL) {
	const response = await axios.get(pageURL, {
		timeout: 15000,
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
		}
	});

	const html = response.data;

	// محاولة استخراج صورة og:image
	const match =
		html.match(
			/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
		) ||
		html.match(
			/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
		);

	if (!match) {
		throw new Error("لم يتم العثور على رابط الصورة.");
	}

	return match[1];
}

module.exports = {
	config: {
		name: "welcome",
		version: "1.0",
		author: "𝙄𝙎𝙎𝙈𝘼𝙄𝙇",
		countDown: 5,
		role: 0,
		description: "Send a random image when the bot joins a group",
		category: "box chat",
		guide: {
			en: "Automatically sends a random image when the bot is added to a group."
		}
	},

	onStart: async function () {
		// هذا الأمر لا يحتاج إلى تشغيل يدوي
	},

	onEvent: async function ({ event, api }) {
		if (event.logMessageType !== "log:subscribe")
			return;

		const botID = api.getCurrentUserID();

		// نتأكد أن البوت هو الذي تمت إضافته
		const addedBot = event.logMessageData?.addedParticipants?.some(
			user => String(user.userFbId) === String(botID)
		);

		if (!addedBot)
			return;

		return async function () {
			try {
				// اختيار صورة عشوائية
				const randomPage =
					IMAGE_PAGES[
						Math.floor(
							Math.random() * IMAGE_PAGES.length
						)
					];

				// تحويل صفحة Postimg إلى رابط الصورة
				const imageURL =
					await getDirectImageURL(randomPage);

				const imageStream =
					await getStreamFromURL(imageURL);

				// إرسال الصورة فقط
				await api.sendMessage(
					{
						attachment: imageStream
					},
					event.threadID
				);

			} catch (error) {
				console.error(
					"[WELCOME IMAGE ERROR]",
					error
				);
			}
		};
	}
};
