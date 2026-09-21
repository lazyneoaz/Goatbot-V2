const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "help",
		aliases: ["menu", "commands"],
		version: "5.0",
		author: "𝙄𝙎𝙎𝙈𝘼𝙄𝙇",
		shortDescription: "Show all available commands",
		longDescription: "Displays a clean and organized categorized list of commands.",
		category: "system",
		guide: "{pn}help [command name]"
	},

	onStart: async function ({ message, args, prefix }) {

		const allCommands = global.GoatBot.commands;
		const categories = {};

		// ==============================
		// تحويل الحروف الإنجليزية إلى Bold
		// ==============================
		const boldText = (text) => {
			const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			const bold = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";

			let result = "";

			for (const char of String(text)) {
				const index = normal.indexOf(char);

				if (index !== -1)
					result += bold[index];
				else
					result += char;
			}

			return result;
		};

		// ==============================
		// معرفة هل الأمر عربي
		// ==============================
		const isArabic = (text) => {
			return /[\u0600-\u06FF]/.test(text);
		};

		// ==============================
		// تنظيف اسم التصنيف
		// ==============================
		const cleanCategoryName = (text) => {
			if (!text)
				return "others";

			return text
				.normalize("NFKD")
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, " ")
				.trim()
				.toLowerCase();
		};

		// ==============================
		// جمع الأوامر
		// ==============================
		for (const [name, cmd] of allCommands) {

			if (!cmd?.config)
				continue;

			const cat = cleanCategoryName(
				cmd.config.category
			);

			if (!categories[cat])
				categories[cat] = [];

			categories[cat].push(cmd.config.name);
		}

		// ==============================
		// معلومات أمر واحد
		// ==============================
		if (args[0]) {

			const query = args.join(" ").toLowerCase();

			const cmd =
				allCommands.get(query) ||
				[...allCommands.values()].find(
					(c) =>
						(c.config.aliases || [])
							.map(x => x.toLowerCase())
							.includes(query)
				);

			if (!cmd)
				return message.reply(
					`❌ Command "${query}" not found.`
				);

			const {
				name,
				version,
				author,
				guide,
				category,
				shortDescription,
				longDescription,
				aliases
			} = cmd.config;

			const desc =
				typeof longDescription === "string"
					? longDescription
					: longDescription?.en ||
					  shortDescription?.en ||
					  shortDescription ||
					  "No description";

			const usage =
				typeof guide === "string"
					? guide.replace(/{pn}/g, prefix)
					: guide?.en?.replace(
							/{pn}/g,
							prefix
					  ) || `${prefix}${name}`;

			const requiredRole =
				cmd.config.role !== undefined
					? cmd.config.role
					: 0;

			return message.reply(
				`▬▬▬▬▬▬▬▬▬▬▬▬\n` +
				`☠️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ☠️\n` +
				`▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +

				`➥ 𝗡𝗮𝗺𝗲: ${boldText(name)}\n` +
				`➥ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${category || "Uncategorized"}\n` +
				`➥ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${desc}\n` +
				`➥ 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${
					aliases?.length
						? aliases.join(", ")
						: "None"
				}\n` +
				`➥ 𝗨𝘀𝗮𝗴𝗲: ${usage}\n` +
				`➥ 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻: ${requiredRole}\n` +
				`➥ 𝗔𝘂𝘁𝗵𝗼𝗿: ${author}\n` +
				`➥ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${version}\n\n` +

				`▬▬▬▬▬▬▬▬▬▬▬▬`
			);
		}

		// ==============================
		// ترتيب الأوامر
		// الإنجليزية أولاً
		// العربية في الأخير
		// ==============================
		const sortCommands = (cmds) => {

			const english = [];
			const arabic = [];

			for (const cmd of cmds) {

				if (isArabic(cmd))
					arabic.push(cmd);
				else
					english.push(cmd);
			}

			english.sort((a, b) =>
				a.toLowerCase().localeCompare(
					b.toLowerCase()
				)
			);

			arabic.sort((a, b) =>
				a.localeCompare(b, "ar")
			);

			return [...english, ...arabic];
		};

		// ==============================
		// ترتيب عمودين
		// ==============================
		const formatCommands = (cmds) => {

			const sorted = sortCommands(cmds);

			const lines = [];

			for (let i = 0; i < sorted.length; i += 2) {

				const first = sorted[i];
				const second = sorted[i + 1];

				const firstFormatted =
					isArabic(first)
						? first
						: boldText(first);

				const secondFormatted =
					second
						? (
							isArabic(second)
								? second
								: boldText(second)
						)
						: "";

				lines.push(
					`┃ ${firstFormatted}` +
					`        ` +
					`${secondFormatted}`
				);
			}

			return lines.join("\n");
		};

		// ==============================
		// عنوان القائمة
		// ==============================
		let msg =
			`▬▬▬▬▬▬▬▬▬▬▬▬\n` +
			`       𝙄𝙎𝙎𝙈𝘼𝙄𝙇\n` +
			`     𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗠𝗘𝗡𝗨\n` +
			`▬▬▬▬▬▬▬▬▬▬▬▬\n`;

		// ==============================
		// ترتيب التصنيفات
		// ==============================
		const sortedCategories =
			Object.keys(categories).sort();

		for (const cat of sortedCategories) {

			msg +=
				`\n╭──『 ${cat.toUpperCase()} 』\n`;

			msg +=
				formatCommands(categories[cat]);

			msg +=
				`\n╰────────────◊\n`;
		}

		msg +=
			`\n▬▬▬▬▬▬▬▬▬▬▬▬\n` +
			`➥ ${boldText("Use")}: ${prefix}help [command]\n` +
			`➥ ${boldText("Bot")}: 𝙄𝙎𝙎𝙈𝘼𝙄𝙇\n` +
			`▬▬▬▬▬▬▬▬▬▬▬▬`;

		return message.reply(msg);
	}
};
