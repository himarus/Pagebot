const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'remini',
  description: 'Enhance the quality of an image using the Kaizen API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: `❗ Please send an image first, then type "remini" to enhance its quality.`
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: '🔄 Enhancing the image quality, please wait...' }, pageAccessToken);

    try {
      const reminiApiUrl = `${api.kaizen}/api/upscale?url=${encodeURIComponent(imageUrl)}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: reminiApiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error enhancing image:', error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
