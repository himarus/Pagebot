const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Upscale or enhance an image using the provided Remini-like API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    try {
      if (!imageUrl) {
        if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        } else {
          return sendMessage(senderId, {
            text: `❗ Please send an image or reply to an image with "remini" to upscale it.`
          }, pageAccessToken);
        }
      }

      await sendMessage(senderId, { text: '✨ Enhancing your image, please wait...' }, pageAccessToken);

      const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.ImageUrl) {
        const enhancedImageUrl = response.data.ImageUrl;

        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: enhancedImageUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('The API did not return an enhanced image URL.');
      }
    } catch (error) {
      console.error('Error in Remini command:', error.response?.data || error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ Error: ${error.response?.data?.error || "Something went wrong while enhancing the image."}`
      }, pageAccessToken);
    }
  }
};
