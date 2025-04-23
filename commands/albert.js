const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'albert',
  description: 'Generate an image of Albert saying your text',
  usage: 'albert <text>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a message.\nUsage: albert naknang buhay to' }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const imageUrl = `${api.yakzy}/albert?text=${encodeURIComponent(text)}`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: imageUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error sending Albert image:', error);
      await sendMessage(senderId, { text: 'Failed to generate Albert image.' }, pageAccessToken);
    }
  }
};
