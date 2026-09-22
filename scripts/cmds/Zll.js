module.exports = {
	config: {
		name: "zll",
		version: "1.0",
		author: "YourName",
		countDown: 3,
		role: 1,
		description: "Send a message repeatedly with a custom delay",
		category: "utility",
		guide: {
			en: "{pn} <message> <count> <delaySeconds>\n{pn} on\n{pn} off"
		}
	},

	onStart: async function ({ message, args, event }) {
		global.zllSpam ??= {};

		const threadID = event.threadID;

		// zll on
		if (args[0]?.toLowerCase() === "on") {
			if (!global.zllSpam[threadID]) {
				return message.reply("❌ لا يوجد Spam مبرمج. استعمل:\nzll <الرسالة> <العدد> <التأخير بالثواني>");
			}

			if (global.zllSpam[threadID].running) {
				return message.reply("⚠️ الـ Spam راه خدام دابا.");
			}

			const data = global.zllSpam[threadID];
			data.running = true;

			message.reply(`✅ بدا الإرسال!\n📩 الرسالة: ${data.text}\n🔢 العدد: ${data.count}\n⏱️ التأخير: ${data.delay / 1000}s`);

			for (let i = 0; i < data.count; i++) {
				if (!global.zllSpam[threadID]?.running)
					break;

				await new Promise(resolve => setTimeout(resolve, data.delay));

				if (!global.zllSpam[threadID]?.running)
					break;

				await message.send(data.text);
			}

			if (global.zllSpam[threadID]) {
				global.zllSpam[threadID].running = false;
			}

			return;
		}

		// zll off
		if (args[0]?.toLowerCase() === "off") {
			if (!global.zllSpam[threadID]?.running) {
				return message.reply("⚠️ ما كاين حتى Spam خدام.");
			}

			global.zllSpam[threadID].running = false;
			return message.reply("🛑 توقف الـ Spam.");
		}

		// إنشاء إعدادات Spam
		if (args.length < 3) {
			return message.reply(
				"❌ الاستعمال الصحيح:\n\n" +
				"zll <الرسالة> <العدد> <التأخير بالثواني>\n\n" +
				"مثال:\n" +
				"zll Hello 10 2\n\n" +
				"ثم:\n" +
				"zll on\n\n" +
				"للتوقيف:\n" +
				"zll off"
			);
		}

		const count = parseInt(args[args.length - 2]);
		const delaySeconds = parseFloat(args[args.length - 1]);

		if (isNaN(count) || count < 1 || count > 1000) {
			return message.reply("❌ العدد يجب أن يكون بين 1 و1000.");
		}

		if (isNaN(delaySeconds) || delaySeconds < 1) {
			return message.reply("❌ التأخير يجب أن يكون ثانية واحدة أو أكثر.");
		}

		const text = args.slice(0, -2).join(" ");
		const delay = delaySeconds * 1000;

		global.zllSpam[threadID] = {
			text,
			count,
			delay,
			running: false
		};

		return message.reply(
			`✅ تم الحفظ.\n\n` +
			`📩 الرسالة: ${text}\n` +
			`🔢 العدد: ${count}\n` +
			`⏱️ التأخير: ${delaySeconds}s\n\n` +
			`اكتب "zll on" للبدء.`
		);
	}
};
