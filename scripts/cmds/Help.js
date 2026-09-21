const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "help",
		aliases: ["menu", "commands"],
		version: "5.0",
		author: "𝙄𝙎𝙎𝙈𝘼𝙄𝙇",
		shortDescription: "Show all available commands",
		longDescription: "Displays a clean and organized list of commands.",
		category: "system",
		guide: "{pn}help [command name]"
	},

	onStart: async function ({ message, args, prefix }) {
		const allCommands = global.GoatBot.commands;
		const categories = {};

		// =========================
		// Bold English text
		// =========================
		const boldText = (text) => {
			const normal =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			const bold =
				"𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭" +
				"𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" +
				"𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";

			let result = "";

			for (const char of String(text)) {
				const index = normal.indexOf(char);
				result += index !== -1 ? bold[index] : char;
			}

			return result;
		};

		// =========================
		// Check Arabic command
		// =========================
		const isArabic = (text) => {
			return /[\u0600-\u06FF]/.test(text);
		};

		// =========================
		// Clean category
		// =========================
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

		// =========================
		// Collect commands
		// =========================
		for (const [name, cmd] of allCommands) {
			if (!cmd || !cmd.config)
				continue;

			const cat = cleanCategoryName(
				cmd.config.category
			);

			if (!categories[cat])
				categories[cat] = [];

			categories[cat].push(
				cmd.config.name
			);
		}

		// =========================
		// Command information
		// =========================
		if (args[0]) {
			const query = args[0].toLowerCase();

			const cmd =
				allCommands.get(query) ||
				[...allCommands.values()].find(
					c =>
						(c.config.aliases || [])
							.map(x => x.toLowerCase())
							.includes(query)
				);

			if (!cmd) {
				return message.reply(
					`❌ Command "${query}" not found.`
				);
			}

			const {
				name,
				version,
				author,
				guide,
				category,
				shortDescription,
				longDescription,
				aliases,
				role
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
					? guide.replace(
							/{pn}/g,
							prefix
					  )
					: guide?.en
						?.replace(
							/{pn}/g,
							prefix
						) ||
					  `${prefix}${name}`;

			const requiredRole =
				role !== undefined ? role : 0;

			return message.reply(
				`▬▬▬▬▬▬▬▬▬▬▬▬\n` +
				`☠️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ☠️\n` +
				`▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +

				`➥ Name: ${boldText(name)}\n` +
				`➥ Category: ${category || "Uncategorized"}\n` +
				`➥ Description: ${desc}\n` +
				`➥ Aliases: ${
					aliases?.length
						? aliases.join(", ")
						: "None"
				}\n` +
				`➥ Usage: ${usage}\n` +
				`➥ Permission: ${requiredRole}\n` +
				`➥ Author: ${author}\n` +
				`➥ Version: ${version}\n\n` +

				`▬▬▬▬▬▬▬▬▬▬▬▬`
			);
		}

		// =========================
		// Format commands in 2 columns
		// English first / Arabic last
		// =========================
		const formatCommands = (cmds) => {
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

			const sorted = [
				...english,
				...arabic
			];

			const lines = [];

			for (let i = 0; i < sorted.length; i += 2) {
				const first = sorted[i];
				const second = sorted[i + 1] || "";

				const firstText =
					isArabic(first)
						? first
						: boldText(first);

				const secondText =
					second
						? (
							isArabic(second)
								? second
								: boldText(second)
						)
						: "";

				lines.push(
					`┃ ${firstText}     ${secondText}`
				);
			}

			return lines.join("\n");
		};

		// =========================
		// Main menu
		// =========================
		let msg =
			`▬▬▬▬▬▬▬▬▬▬▬▬\n` +
			`        𝙄𝙎𝙎𝙈𝘼𝙄𝙇\n` +
			`      𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗠𝗘𝗡𝗨\n` +
			`▬▬▬▬▬▬▬▬▬▬▬▬\n`;

		const sortedCategories =
			Object.keys(categories).sort();

		for (const cat of sortedCategories) {
			msg +=
				`\n╭──『 ${cat.toUpperCase()} 』\n`;

			msg += formatCommands(
				categories[cat]
			);

			msg +=
				`\n╰────────────◊\n`;
		}

		msg +=
			`\n▬▬▬▬▬▬▬▬▬▬▬▬\n` +
			`➥ Use: ${prefix}help [command name]\n` +
			`▬▬▬▬▬▬▬▬▬▬▬▬`;

		return message.reply(msg);
	}
};
