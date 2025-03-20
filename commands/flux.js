const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate an image using Flux AI via Hazeyy\'s API.',
  usage: 'flux <description>\nExample: flux A cat and a dog',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const text = args.join(' ');

    if (!text || text.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a description for the image.\n\nExample: *flux A cat and a dog*'
      }, pageAccessToken);
      return;
    }

    // Send a "Generating image..." message first
    await sendMessage(senderId, { text: '⏳ Generating image, please wait...' }, pageAccessToken);

    const apiUrl = `${api.hazey}/api/fluxx?text=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.imageUrl) {
        const imageUrl = response.data.imageUrl; // Get the actual image URL

        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in Flux command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while generating the image. Please try again later.`
      }, pageAccessToken);
    }
  }
};
