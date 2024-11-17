const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "ai",
  description: "Interact with AI for text-based queries, image recognition, browsing, and image generation.",
  author: "chilli",

  async execute(senderId, args, pageAccessToken, event) {
    const prompt = args.join(" ");
    let imageUrl = null;

    if (!prompt) {
      return sendMessage(senderId, {
        text: `𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘲𝘶𝘦𝘴𝘵𝘪𝘰𝘯.\n\n𝘌𝘹𝘢𝘮𝘱𝘭𝘦: 𝘈𝘪 𝘸𝘩𝘢𝘵 𝘪𝘴 𝘤𝘩𝘪𝘭𝘭𝘪?`
      }, pageAccessToken);
    }

    if (event.message?.attachments && event.message.attachments[0]?.type === "image") {
      imageUrl = event.message.attachments[0].payload.url;
    }

    const repliedMid = event.message?.reply_to?.mid || null;

    try {
      const apiUrl = `${api.jonelApi}/api/gpt4o-v2`;
      const params = imageUrl ? { prompt, imageUrl } : { prompt };

      const response = await axios.get(apiUrl, { params });
      const result = response.data.response;

      if (result.startsWith("TOOL_CALL: analyzeImage")) {
        const analysis = result.replace("TOOL_CALL: analyzeImage", "").trim();
        await sendMessage(senderId, { text: `📊 **Image Analysis Result:**\n\n${analysis}` }, pageAccessToken);
      } else if (result.includes("TOOL_CALL: generateImage")) {
        await sendMessage(senderId, { text: `🎨 Generating image... Please wait.` }, pageAccessToken);

        const imageUrlMatch = result.match(/\!\[.*?\]\((https:\/\/.*?)\)/);
        if (imageUrlMatch && imageUrlMatch[1]) {
          const generatedImageUrl = imageUrlMatch[1];
          await sendMessage(senderId, {
            attachment: {
              type: "image",
              payload: {
                url: generatedImageUrl,
              },
            },
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: result }, pageAccessToken);
        }
      } else if (result.includes("TOOL_CALL: browseWeb")) {
        await sendMessage(senderId, { text: `🌐 Browsing the web... Hold tight!` }, pageAccessToken);

        const browseData = result.replace("TOOL_CALL: browseWeb", "").trim();
        await sendMessage(senderId, { text: browseData }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: result }, pageAccessToken, repliedMid);
      }

    } catch (error) {
      sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`,
      }, pageAccessToken);
    }
  },
};
