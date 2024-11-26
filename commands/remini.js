const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Upscale or enhance an image using the provided Remini-like API.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: `Please send an image first, then type "remini" to upscale or enhance the image.`
      }, pageAccessToken);
    }

    await sendMessage(senderId, { 
      text: 'Enhancing your image, please wait... ✨' 
    }, pageAccessToken);

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await axios.get(apiUrl);
      const { ImageUrl } = response.data;

      if (!ImageUrl) {
        throw new Error('No enhanced image returned by the API.');
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: ImageUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error enhancing image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
