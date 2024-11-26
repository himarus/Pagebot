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
      // Call the API with the provided image URL
      const apiUrl = `https://api.kenliejugarap.com/imgrestore/?imgurl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      // Ensure the response contains image data
      if (!response.data || !response.headers['content-type'].startsWith('image/')) {
        throw new Error('API did not return a valid image.');
      }

      // Convert the image buffer to base64 and send it
      const enhancedImageBuffer = Buffer.from(response.data, 'binary');
      const contentType = response.headers['content-type'];
      const enhancedImageBase64 = `data:${contentType};base64,${enhancedImageBuffer.toString('base64')}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: enhancedImageBase64,
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
