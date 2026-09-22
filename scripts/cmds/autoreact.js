module.exports = {
	config: {
		name: "autoreact",
		version: "1.0",
		author: "YourName",
		countDown: 3,
		role: 1,
		description: "Automatically react to messages",
		category: "utility",
		guide: {
			en: "{pn} on\n{pn} off"
		}
	},

	onStart: async function ({ event, message }) {
		global.autoReact ??= {};

		const threadID = event.threadID;
		const option = event.body
			.replace(/^\S+\s*/, "")
			.trim()
			.toLowerCase();

		if (option === "on") {
			if (global.autoReact[threadID]) {
				return message.reply("⚠️ AutoReact راه خدام دابا.");
			}

			global.autoReact[threadID] = true;

			return message.reply(
				"✅ تم تشغيل AutoReact 😈\n" +
				"🤖 غادي نتفاعل مع الرسائل تلقائياً."
			);
		}

		if (option === "off") {
			if (!global.autoReact[threadID]) {
				return message.reply("⚠️ AutoReact راه مطفي أصلاً.");
			}

			delete global.autoReact[threadID];

			return message.reply("🛑 تم إيقاف AutoReact.");
		}

		return message.reply(
			"❌ الاستعمال الصحيح:\n\n" +
			"autoreact on\n" +
			"autoreact off"
		);
	},

	onChat: async function ({ api, event }) {
		global.autoReact ??= {};

		if (!global.autoReact[event.threadID])
			return;

		if (!event.messageID)
			return;

		const reactions = [
			"😈", "🇮🇳", "🦅", "🪻", "🐤",
			"🌚", "🤍", "🖤", "🎀", "💋",
			"😱", "😗", "🥺", "🤯", "🏇",
			"🎨", "🎭", "🎲", "🪃", "🥏",
			"🛠️", "⚒️", "⛏️", "🗞️", "📦",
			"💡", "🧊", "🧃", "🫧",

			// إضافية
			"🔥", "❤️", "💜", "💙", "💚",
			"💛", "🩷", "🩵", "🤎", "🩶",
			"💀", "👑", "😎", "🤡", "👀",
			"🫀", "🧿", "✨", "🌟", "⭐",
			"⚡", "☠️", "👹", "👺", "😈",
			"🙈", "🙉", "🙊", "🫠", "🤨",
			"😏", "😂", "🤣", "😭", "😳",
			"🤩", "🥶", "🥵", "😴", "🤔",
			"🫡", "🎃", "👻", "💫", "🌙"
		];

		const reaction =
			reactions[Math.floor(Math.random() * reactions.length)];

		try {
			await api.setMessageReaction(
				reaction,
				event.messageID,
				(error) => {
					if (error)
						console.error("AutoReact error:", error);
				},
				true
			);
		} catch (error) {
			console.error("AutoReact error:", error);
		}
	}
};
