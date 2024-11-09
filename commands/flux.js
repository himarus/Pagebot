const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "flux",
  description: "Generate an image based on a prompt using the Flux API and upload to Imgur.",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(chilli, { 
        text: `⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘱𝘳𝘰𝘮𝘱𝘵 𝘧𝘰𝘳 𝘪𝘮𝘢𝘨𝘦 𝘨𝘦𝘯𝘦𝘳𝘢𝘵𝘪𝘰𝘯.\n\nExample: 𝘧𝘭𝘶𝘹 𝘤𝘢𝘵` 
      }, kalamansi);
      return;
    }

    await sendMessage(chilli, { text: `🎨 Generating your image of "${prompt}"...` }, kalamansi);

    try {
      // Step 1: Generate the image with the Flux API
      const fluxResponse = await axios.get(`${api.jonelApi}/api/flux`, {
        params: { prompt: prompt },
        responseType: 'arraybuffer' // to handle image binary data
      });

      // Convert the binary data to base64
      const imageBase64 = Buffer.from(fluxResponse.data, 'binary').toString('base64');
      const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

      // Step 2: Upload the image to Imgur
      await sendMessage(chilli, { text: "Uploading the image to Imgur, please wait..." }, kalamansi);

      const imgurResponse = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(imageUrl)}`);
      const imgurLink = imgurResponse?.data?.uploaded?.image;

      if (!imgurLink) {
        throw new Error('Imgur link not found in the response');
      }

      // Step 3: Send the Imgur link to the user
      await sendMessage(chilli, {
        text: `Here is the Imgur link for your generated image:\n\n${imgurLink}`
      }, kalamansi);

    } catch (error) {
      console.error("Error in Flux command:", error.response?.data || error.message);
      sendMessage(chilli, { 
        text: "⚠️ An error occurred while generating or uploading the image. Please try again later or contact support." 
      }, kalamansi);
    }
  }
};
