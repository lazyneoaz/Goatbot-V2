module.exports = {
	config: {
		name: "افشخ",
		version: "1.0",
		author: "YourName",
		countDown: 3,
		role: 0,
		description: "Split a replied message into separate words",
		category: "utility",
		guide: {
			en: "{pn} (reply to a message)"
		}
	},

	onStart: async function ({ api, event, message }) {
		if (!event.messageReply) {
			return message.reply(
				"❌ خاصك ترد على رسالة وتكتب: افشخ"
			);
		}

		const text = event.messageReply.body?.trim();

		if (!text) {
			return message.reply("❌ الرسالة اللي رديتي عليها ما فيهاش نص.");
		}

		const words = text.split(/\s+/);

		for (const word of words) {
			await message.send(word);

			// تأخير بسيط بين الرسائل
			await new Promise(resolve =>
				setTimeout(resolve, 300)
			);
		}
	}
};
