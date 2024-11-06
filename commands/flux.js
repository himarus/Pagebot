const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "flux",
  description: "Generate an image based on the given prompt using the Flux API.",
  author: "chilli",

  async execute(data, args, pageBot) {
    const prompt = args.join(" ");
    if (!prompt) return sendMessage(data, { text: `Please provide a description for the image.\nex: flux dog` }, pageBot);

    await sendMessage(data, { text: `🖌️ Generating image...` }, pageBot);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const response = await axios.get("https://heru-apiv2.onrender.com/api/flux", {
        params: { prompt: prompt },
        responseType: 'arraybuffer'  // Set response type to arraybuffer for image binary data
      });

      const imageBuffer = Buffer.from(response.data, 'binary'); // Convert binary data to Buffer

      await sendMessage(data, {
        attachment: {
          type: 'image',
          payload: { is_reusable: true }
        },
        file: imageBuffer // Attach the image buffer as the file
      }, pageBot);

    } catch (error) {
      const errorMessage = error.response?.data?.message || "⚠️ An unexpected error occurred. Please try again.";
      sendMessage(data, { text: `⚠️ Error: ${errorMessage}` }, pageBot);
    }
  }
};

