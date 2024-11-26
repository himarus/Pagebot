const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance an image using the provided Remini-like API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '❗ No image detected. Please send an image attachment first, then type "remini" or reply to an image using the "remini" command.'
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: '✨ Enhancing the image, please wait...' }, pageAccessToken);

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      const enhancedImageUrl = response?.data?.ImageUrl;

      if (!enhancedImageUrl) {
        throw new Error('Enhanced image URL not found in the response');
      }

      await sendMessage(senderId, {
        text: `✅ Your image has been enhanced! You can view/download it here:\n\n${enhancedImageUrl}`,
        attachment: {
          type: 'image',
          payload: {
            url: enhancedImageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error enhancing image:', error.message || error.response?.data);
      await sendMessage(senderId, {
        text: '🚧 An error occurred while enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
