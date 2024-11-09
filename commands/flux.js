const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "flux",
  description: "Generate an image based on a prompt using the Flux API.",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(chilli, { text: `⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘱𝘳𝘰𝘮𝘱𝘵 𝘧𝘰𝘳 𝘪𝘮𝘢𝘨𝘦 𝘨𝘦𝘯𝘦𝘳𝘢𝘵𝘪𝘰𝘯.\n\nExample: 𝘧𝘭𝘶𝘹 𝘤𝘢𝘵` }, kalamansi);
    }

    await sendMessage(chilli, { text: `🎨 Generating your image of "${prompt}"...` }, kalamansi);

    try {
      const response = await axios.get(`${api.jonelApi}/api/flux`, {
        params: { prompt: prompt },
        responseType: 'arraybuffer' // to handle image binary data
      });

      const imageBuffer = Buffer.from(response.data, 'binary'); // Convert binary data to buffer

      await sendMessage(chilli, {
        attachment: {
          type: 'image',
          payload: {
            buffer: imageBuffer
          }
        }
      }, kalamansi);

    } catch (error) {
      sendMessage(chilli, { text: "⚠️ Error while generating the image. Please try again or contact support." }, kalamansi);
    }
  }
};
