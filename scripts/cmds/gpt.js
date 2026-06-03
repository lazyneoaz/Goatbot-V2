const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_URL = "https://images2gpt-api.onrender.com/api";

module.exports = {
  config: {
    name: "gpt2",
    aliases: ["gpt", "gptimg"],
    version: "1.2.0",
    author: "Neoaz 🐦",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Generate or edit images" },
    longDescription: { en: "Generate high-quality images or edit them via reply. Usage: {pn} <prompt> --ar <ratio>" },
    category: "ai",
    guide: { en: "{pn} a cat --ar 1:1 (or reply to an image)" }
  },

  onStart: async function ({ message, event, args }) {
    let prompt = args.join(" ");
    let imageUrl = null;
    let aspectRatio = "16:9";

    const arMatch = prompt.match(/--ar\s+(\d+:\d+)/);
    if (arMatch) {
      aspectRatio = arMatch[1];
      prompt = prompt.replace(arMatch[0], "").trim();
    }

    if (event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo") imageUrl = attachment.url;
    }

    if (!prompt && !imageUrl) return message.reply("Please provide a prompt or reply to an image.");

    const statusMsg = imageUrl ? "✂️ Editing......" : "⏳ Generating.......";
    const info = await message.reply(statusMsg);

    try {
      let endpoint = `${API_URL}/generate`;
      let payload = { prompt: prompt || "Edit this image", resolution: "1K", aspect_ratio: aspectRatio };

      if (imageUrl) {
        endpoint = `${API_URL}/img2img`;
        payload.image_url = imageUrl;
      }

      const response = await axios.post(endpoint, payload);
      const { success, images } = response.data;
      
      if (!success || !images || images.length === 0) throw new Error("No image data returned.");

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      
      const attachments = [];
      const paths = [];

      for (const url of images) {
        const imgPath = path.join(cacheDir, `gpt2_${Date.now()}_${Math.random()}.png`);
        const imgRes = await axios.get(url, { responseType: "arraybuffer" });
        await fs.writeFile(imgPath, Buffer.from(imgRes.data));
        attachments.push(fs.createReadStream(imgPath));
        paths.push(imgPath);
      }

      await message.reply({ body: "✅ Result:", attachment: attachments });
      paths.forEach(p => fs.remove(p).catch(() => {}));

    } catch (error) {
      message.reply(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  }
};
