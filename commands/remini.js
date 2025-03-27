const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance an image using AI',
  usage: 'Reply with "remini" to an image',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event) {
    // Check if the user replied with "remini" to an image
    if (!event.message || !event.message.attachments || event.message.attachments[0].type !== 'image') {
      return sendMessage(senderId, {
        text: 'Please reply with "remini" to an image to enhance it.'
      }, pageAccessToken);
    }

    const imageUrl = event.message.attachments[0].payload.url;
    const apiUrl = `https://renzsuperb.onrender.com/api/enhancev1?url=${encodeURIComponent(imageUrl)}`;

    try {
      const response = await axios.get(apiUrl, { responseType: 'json' });

      if (!response.data || !response.data.url) {
        throw new Error('No enhanced image found.');
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: response.data.url, is_reusable: true }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in Remini command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
