const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'anigif',
  description: 'Send a random anime gif image.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const imageUrl = `${api.rapid}/api/animegif`;

    try {
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
      console.error('Error sending anime gif:', error);
      await sendMessage(senderId, { text: '⚠️ Failed to fetch anime gif.' }, pageAccessToken);
    }
  }
};
