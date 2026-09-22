const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BASE_URL = "https://play.nkx.lol";
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

const HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
	"Accept": "application/json, text/plain, */*"
};

function resolveUrl(uri, baseUrl) {
	try {
		return new URL(uri, baseUrl).href;
	} catch {
		return uri;
	}
}

function parsePlaylist(text, baseUrl) {
	let initUrl = null;
	const segments = [];

	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();

		if (!line)
			continue;

		if (line.startsWith("#EXT-X-MAP:")) {
			const match = line.match(/URI="([^"]+)"/);

			if (match)
				initUrl = resolveUrl(match[1], baseUrl);

		} else if (!line.startsWith("#")) {
			segments.push(
				resolveUrl(line, baseUrl)
			);
		}
	}

	return {
		initUrl,
		segments
	};
}

async function getPlaylist(url) {
	const res = await axios.get(url, {
		headers: HEADERS,
		timeout: 20000,
		responseType: "text"
	});

	const text = String(res.data);

	if (text.includes("#EXT-X-STREAM-INF")) {
		const variant = text
			.split(/\r?\n/)
			.map(x => x.trim())
			.find(
				x =>
					x &&
					!x.startsWith("#")
			);

		if (!variant)
			throw new Error(
				"No HLS variant found."
			);

		return getPlaylist(
			resolveUrl(variant, url)
		);
	}

	return parsePlaylist(text, url);
}

async function downloadHLS(url) {
	const playlist = await getPlaylist(url);

	if (!playlist.segments.length) {
		throw new Error(
			"No audio segments found."
		);
	}

	const buffers = [];
	let total = 0;

	if (playlist.initUrl) {
		const init = await axios.get(
			playlist.initUrl,
			{
				headers: HEADERS,
				responseType: "arraybuffer",
				timeout: 20000
			}
		);

		const buffer = Buffer.from(init.data);

		total += buffer.length;

		buffers.push(buffer);
	}

	for (const segment of playlist.segments) {
		const res = await axios.get(
			segment,
			{
				headers: HEADERS,
				responseType: "arraybuffer",
				timeout: 20000
			}
		);

		const buffer = Buffer.from(res.data);

		total += buffer.length;

		if (total > MAX_ATTACHMENT_BYTES) {
			throw new Error(
				"Audio is larger than 25MB."
			);
		}

		buffers.push(buffer);
	}

	return {
		buffer: Buffer.concat(buffers),
		m4a: Boolean(playlist.initUrl)
	};
}

module.exports = {
	config: {
		name: "sing",
		aliases: ["song", "music"],
		version: "1.2",
		author: "Ismail",
		countDown: 5,
		role: 0,

		shortDescription: {
			en: "Search and download a song"
		},

		longDescription: {
			en: "Search and download a song."
		},

		category: "media",

		guide: {
			en: "{pn} <song name>"
		}
	},

	onStart: async function ({
		message,
		args,
		event,
		api
	}) {

		const query = args.join(" ").trim();

		if (!query) {
			return message.reply(
				"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
				"🎵 𝗦𝗜𝗡𝗚\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
				"❌ Please enter a song name.\n\n" +
				"Example:\n" +
				"sing Believer\n\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬"
			);
		}

		try {
			await api.setMessageReaction(
				"⏳",
				event.messageID
			);
		} catch {}

		try {

			// =========================
			// SEARCH
			// =========================
			const searchURL =
				`${BASE_URL}/search`;

			const response =
				await axios.get(
					searchURL,
					{
						params: {
							q: query,
							limit: 1
						},

						headers: HEADERS,

						timeout: 25000,

						validateStatus:
							() => true
					}
				);

			// =========================
			// API ERROR
			// =========================
			if (response.status !== 200) {

				console.error(
					"[SING SEARCH]",
					response.status,
					response.data
				);

				await api.setMessageReaction(
					"❌",
					event.messageID
				);

				return message.reply(
					"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
					"🎵 𝗦𝗜𝗡𝗚\n" +
					"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
					`❌ Search API error: ${response.status}\n\n` +
					"الخدمة الخاصة بالبحث غير متاحة حالياً.\n\n" +
					"▬▬▬▬▬▬▬▬▬▬▬▬"
				);
			}

			const data = response.data;

			console.log(
				"[SING SEARCH RESPONSE]",
				JSON.stringify(
					data,
					null,
					2
				)
			);

			const results =
				data?.results;

			if (
				!Array.isArray(results) ||
				results.length === 0
			) {

				await api.setMessageReaction(
					"❌",
					event.messageID
				);

				return message.reply(
					"❌ No song found."
				);
			}

			const song = results[0];

			const streamURL =
				song.audio_cdn_url;

			const title =
				song.title ||
				query;

			if (!streamURL) {

				console.error(
					"[SING] Missing audio_cdn_url:",
					song
				);

				await api.setMessageReaction(
					"❌",
					event.messageID
				);

				return message.reply(
					"❌ تم العثور على الأغنية، لكن رابط الصوت غير موجود في API."
				);
			}

			// =========================
			// DOWNLOAD
			// =========================
			const audio =
				await downloadHLS(
					streamURL
				);

			if (
				!audio.buffer ||
				audio.buffer.length === 0
			) {
				throw new Error(
					"Downloaded audio is empty."
				);
			}

			// =========================
			// SAVE FILE
			// =========================
			const cache =
				path.join(
					__dirname,
					"cache"
				);

			await fs.ensureDir(cache);

			const extension =
				audio.m4a
					? "m4a"
					: "aac";

			const filePath =
				path.join(
					cache,
					`${Date.now()}.${extension}`
				);

			await fs.writeFile(
				filePath,
				audio.buffer
			);

			// =========================
			// SEND
			// =========================
			await message.reply({
				body:
					"🎵 " +
					title +
					"\n▬▬▬▬▬▬▬▬▬▬▬▬",
				attachment:
					fs.createReadStream(
						filePath
					)
			});

			await api.setMessageReaction(
				"✅",
				event.messageID
			);

			// حذف الملف
			setTimeout(() => {
				fs.remove(filePath)
					.catch(() => {});
			}, 10000);

		} catch (error) {

			console.error(
				"\n========== SING ERROR =========="
			);

			console.error(
				"Message:",
				error?.message
			);

			console.error(
				"Status:",
				error?.response?.status
			);

			console.error(
				"Response:",
				error?.response?.data
			);

			console.error(
				"URL:",
				error?.config?.url
			);

			console.error(
				"================================\n"
			);

			try {
				await api.setMessageReaction(
					"❌",
					event.messageID
				);
			} catch {}

			return message.reply(
				"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
				"🎵 𝗦𝗜𝗡𝗚\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
				"❌ حدث خطأ أثناء تحميل الأغنية.\n\n" +
				"افتح Console ديال البوت باش تشوف الخطأ الحقيقي.\n\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬"
			);
		}
	}
};
