const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance or upscale an image attachment.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '❗ No attachment detected. Please send an image first, then type "remini" or reply to an image using "remini".'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://api.kenliejugarap.com/imgrestore/?imgurl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const enhancedImageBuffer = response.data;
      const contentType = response.headers['content-type'];

      if (!enhancedImageBuffer || !contentType.startsWith('image/')) {
        throw new Error('API did not return a valid image.');
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: `data:${contentType};base64,${enhancedImageBuffer.toString('base64')}`,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error enhancing image:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
