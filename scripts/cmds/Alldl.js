const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "alldl",
    aliases: ["fbdl", "igdl", "ttdl", "ytdl", "dl"],
    version: "2.6",
    author: "Neoaz 🐦",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Multi-platform video/audio downloader" },
    longDescription: { en: "Download videos or audio from FB, IG, TikTok, YT via link or auto-detection. Use --a for audio." },
    category: "media",
    guide: { en: "{pn} <url> [--a] or reply to a link. Use '{pn} auto' to toggle auto-download." }
  },

  onStart: async function ({ message, args, event, api }) {
    if (args[0] === "auto") {
      if (!global.alldl_auto) global.alldl_auto = {};
      const threadID = event.threadID;
      global.alldl_auto[threadID] = !global.alldl_auto[threadID];
      return message.reply(`Auto-download is now ${global.alldl_auto[threadID] ? "ON" : "OFF"}.`);
    }

    let url = args[0];
    let isAudio = args.includes("--a");

    if (event.type === "message_reply") {
      const urlMatch = event.messageReply.body.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        url = urlMatch[0];
        if (args.includes("--a") || args[0] === "--a") isAudio = true;
      }
    }

    if (!url || !url.startsWith("http")) return message.reply("Please provide a valid link.");
    return this.handleDownload({ message, event, api, url, isAudio });
  },

  onChat: async function ({ message, event, api }) {
    const threadID = event.threadID;
    if (!global.alldl_auto?.[threadID] || !event.body) return;

    if (event.body.startsWith(global.GoatBot.config.prefix)) return;

    const urlMatch = event.body.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      return this.handleDownload({ message, event, api, url: urlMatch[0], isAudio: false });
    }
  },

  handleDownload: async function ({ message, event, api, url, isAudio }) {
    api.setMessageReaction("⏳", event.messageID);
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const fileName = `dl_${Date.now()}.${isAudio ? "mp3" : "mp4"}`;
    const filePath = path.join(cacheDir, fileName);

    try {
      const res = await axios.get(`https://neoaz.is-a.dev/api/download?url=${encodeURIComponent(url)}`);
      const data = res.data.data;
      if (!data || !data.formats || data.formats.length === 0) throw new Error();

      let downloadUrl = "";
      if (isAudio) {
        const audioFormat = data.formats.find(f => f.quality === "audio_only" || f.ext === "mp3" || f.ext === "m4a" || f.ext === "weba");
        downloadUrl = audioFormat?.url || data.formats[data.formats.length - 1].url;
      } else {
        const videoFormat = data.formats.find(f => f.quality === "hd_no_watermark" || f.quality === "no_watermark" || f.quality === "HD" || f.quality === "Full HD" || f.quality === "720p");
        downloadUrl = videoFormat?.url || data.formats[0].url;
      }

      if (!downloadUrl) throw new Error();

      const response = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://tikwm.com/'
        }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await message.reply({
        body: `${data.title}`,
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", event.messageID);
    } catch (error) {
      api.setMessageReaction("❌", event.messageID);
    } finally {
      if (fs.existsSync(filePath)) setTimeout(() => fs.unlinkSync(filePath), 10000);
    }
  }
};
