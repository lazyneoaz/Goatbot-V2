module.exports = {
	config: {
		name: "developer",
		version: "1.0",
		author: "YourName",
		countDown: 3,
		role: 0,
		description: "Show developer information",
		category: "info",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message }) {
		const imageURL =
			"https://i.postimg.cc/LRbLYPqD/e24d96a475fc620ee907fc12ee01e64f.jpg";

		const text = `
▬▬▬▬▬▬▬▬▬▬▬▬
💮 𝙃𝙀𝙇𝙇𝙊 💮
▬▬▬▬▬▬▬▬▬▬▬▬

💮 𝙃𝙚𝙡𝙡𝙤, 𝙄 𝙖𝙢 𝙄𝙨𝙢𝙖𝙞𝙡 𝙈𝙚𝙙𝙙𝙖𝙝'𝙨 𝘽𝙤𝙩 💮

▬▬▬▬▬▬▬▬▬▬▬▬
💜 𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍 𝙄𝙉𝙁𝙊 🧡
▬▬▬▬▬▬▬▬▬▬▬▬

👤 𝙉𝙖𝙢𝙚: 𝙄𝙨𝙢𝙖𝙞𝙡 🐤💕
🎀 𝙉𝙞𝙘𝙠𝙣𝙖𝙢𝙚: 𝙈𝙚𝙙𝙙𝙖𝙝 🎀🪻
🎂 𝘼𝙜𝙚: 15 🐤🫧
💗 𝙍𝙚𝙡𝙖𝙩𝙞𝙤𝙣𝙨𝙝𝙞𝙥: 𝙎𝙞𝙣𝙜𝙡𝙚 🥹💗

▬▬▬▬▬▬▬▬▬▬▬▬
😙 𝘾𝙊𝙉𝙏𝘼𝘾𝙏 𝙏𝙃𝙀 𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍 😙
▬▬▬▬▬▬▬▬▬▬▬▬

🟢 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥: zeyphex_09

🟠 𝙄𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢: Z.eyphex_09

🔵 𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠:
https://www.facebook.com/profile.php?id=61594329770983

▬▬▬▬▬▬▬▬▬▬▬▬
👑 𝙏𝙝𝙖𝙣𝙠 𝙮𝙤𝙪 𝙛𝙤𝙧 𝙪𝙨𝙞𝙣𝙜
𝙎𝙞𝙢𝙥𝙡𝙚 𝙆𝙞𝙣𝙜 𝘽𝙤𝙩 👑
▬▬▬▬▬▬▬▬▬▬▬▬
`;

		try {
			const image =
				await global.utils.getStreamFromURL(imageURL);

			return message.reply({
				body: text,
				attachment: image
			});
		} catch (error) {
			console.error("developer error:", error);

			return message.reply(text);
		}
	}
};
