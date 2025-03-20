const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c'; // Palitan ng iyong Imgbb API Key

module.exports = {
  name: 'poli',
  description: 'Generate an image based on the provided prompt using Hazey API and send it via Imgbb.',
  usage: 'poli <prompt>',
  author: 'your_name',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation. Example: poli A futuristic robot.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const imageUrl = `${api.hazey}/api/poli2?prompt=${encodeURIComponent(prompt)}`;

    try {
      // Step 1: Notify user that image is being generated
      await sendMessage(senderId, { text: '⏳ Generating your image, please wait...' }, pageAccessToken);

      // Step 2: Upload image to Imgbb
      const imgbbResponse = await axios.post(`https://api.imgbb.com/1/upload`, null, {
        params: {
          key: IMGBB_API_KEY,
          image: imageUrl, // Directly pass the image URL
        },
      });

      if (imgbbResponse.data.success) {
        const imgbbUrl = imgbbResponse.data.data.url;

        // Step 3: Send uploaded image via Messenger
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: { url: imgbbUrl },
          },
        }, pageAccessToken);
      } else {
        throw new Error('Imgbb upload failed.');
      }

    } catch (error) {
      console.error('Error in poli command:', error.message || error);
      await sendMessage(senderId, { text: 'Error: Could not generate image. Please try again later.' }, pageAccessToken);
    }
  }
};
