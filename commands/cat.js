const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'cat',
  description: 'Send a random cat image.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    try {
      const response = await axios.get(`${api.rapid}/api/cat`);
      const imageUrl = response.data?.image;

      if (!imageUrl) {
        return sendMessage(senderId, {
          text: 'Failed to fetch cat image. Please try again later.'
        }, pageAccessToken);
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in cat command:', error.message || error);
      await sendMessage(senderId, {
        text: 'An error occurred while fetching the cat image.'
      }, pageAccessToken);
    }
  }
};
