const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generate an AI image based on a prompt.',
  usage: 'imagine <prompt>\nExample: imagine dog',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');

    if (!prompt) {
      await sendMessage(senderId, {
        text: '❗ Please provide a prompt to imagine.\n\nExample: imagine dog'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `https://ccprojectapis.ddns.net/api/imaginev2?prompt=${encodeURIComponent(prompt)}`;

    await sendMessage(senderId, { text: `🔍 Generating image for: "${prompt}"... This may take a while, please wait.` }, pageAccessToken);

    try {
      // Step 1: Generate the image
      const response = await axios.get(apiUrl);
      const { imageUrl } = response.data;

      if (!imageUrl) {
        await sendMessage(senderId, {
          text: `⚠️ No image was generated for the prompt "${prompt}". Please try a different prompt.`
        }, pageAccessToken);
        return;
      }

      // Step 2: Upload the generated image to Imgur
      const imgurResponse = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(imageUrl)}`);
      const imgurLink = imgurResponse?.data?.uploaded?.image;

      if (!imgurLink) {
        throw new Error('Imgur link not found in the response');
      }

      // Step 3: Send the uploaded Imgur image as an attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: imgurLink
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating or uploading image:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
