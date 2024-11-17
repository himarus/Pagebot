const axios = require("axios");
const { sendMessage, getRepliedImage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "ai",
  description: "Interact with GPT-4 for image analysis, text-based queries, image generation, and web browsing.",
  author: "chilli",

  async execute(chilli, args, kalamansi, event) {
    const prompt = args.join(" ");
    let imageUrl = null;

    if (!prompt) {
      return sendMessage(chilli, {
        text: `𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘲𝘶𝘦𝘴𝘵𝘪𝘰𝘯.\n\n𝘌𝘹𝘢𝘮𝘱𝘭𝘦: 𝘈𝘪 𝘸𝘩𝘢𝘵 𝘪𝘴 𝘤𝘩𝘪𝘭𝘭𝘪?`
      }, kalamansi);
    }

    if (event.message?.reply_to && event.message.reply_to.mid) {
      try {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, kalamansi);
      } catch (error) {
        return sendMessage(chilli, {
          text: "⚠️ Unable to fetch the replied image. Please try again."
        }, kalamansi);
      }
    }

    const fullPrompt = imageUrl ? `${prompt} ${imageUrl}` : prompt;

    try {
      const response = await axios.get(`${api.jonelApi}/api/gpt4o-v2`, {
        params: { prompt: fullPrompt }
      });

      const result = response.data.response;

      if (result.includes("TOOL_CALL: analyzeImage")) {
        const analysis = result.replace("TOOL_CALL: analyzeImage", "").trim();
        await sendMessage(chilli, {
          text: `📊 **Image Analysis Complete**:\n\n${analysis}`
        }, kalamansi);

      } else if (result.includes("TOOL_CALL: generateImage")) {
        await sendMessage(chilli, { text: `🎨 Generating image... Please wait.` }, kalamansi);
        const imageUrlMatch = result.match(/\!\[.*?\]\((https:\/\/.*?)\)/);
        if (imageUrlMatch && imageUrlMatch[1]) {
          const generatedImageUrl = imageUrlMatch[1];
          await sendMessage(chilli, {
            attachment: {
              type: "image",
              payload: { url: generatedImageUrl }
            }
          }, kalamansi);
        } else {
          await sendMessage(chilli, { text: result }, kalamansi);
        }

      } else if (result.includes("TOOL_CALL: browseWeb")) {
        await sendMessage(chilli, { text: `🌐 Browsing the web... Hold tight!` }, kalamansi);
        const browseData = result.replace("TOOL_CALL: browseWeb", "").trim();
        await sendMessage(chilli, { text: browseData }, kalamansi);

      } else {
        await sendMessage(chilli, { text: result }, kalamansi);
      }

    } catch (error) {
      sendMessage(chilli, {
        text: "⚠️ Error while processing your request. Please try again later."
      }, kalamansi);
    }
  }
};
