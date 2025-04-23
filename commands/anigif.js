const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'anigif',
  description: 'Send a random anime gif image.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    try {
      const response = await axios.get(`${api.rapid}/api/animegif`);
      
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
      console.error('Error in anigif command:', error.message || error);
      await sendMessage(senderId, {
        text: 'An error occurred while fetching the anime gif.'
      }, pageAccessToken);
    }
  }
};
