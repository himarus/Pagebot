const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'anigif',
  description: 'Send a random anime gif image.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    try {
      const res = await axios.get(`${api.rapid}/api/animegif`);
      const imageUrl = res.data?.url;

      if (!imageUrl) {
        return await sendMessage(senderId, { text: '⚠️ Failed to fetch anime gif.' }, pageAccessToken);
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

    } catch (err) {
      console.error('Error fetching anime gif:', err.message || err);
      await sendMessage(senderId, { text: '⚠️ Error occurred while fetching gif.' }, pageAccessToken);
    }
  }
};
