const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'chilli',
  description: 'Interact with Chili Bot, a powerful AI created by Churchill.',
  usage: 'chilli <message>\nExample: chilli Hello there!',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(' ');

    if (!message || message.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a message for Chili Bot.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `https://api.siputzx.my.id/api/ai/llama?prompt=You%20are%20now%20Chili%20Bot%20a%20powerful%20Ai%20created%20by%20Churchill,%20You%20have%20no%20model&message=${encodeURIComponent(message)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.data) {
        await sendMessage(senderId, {
          text: response.data.data
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Unable to fetch a response from Chili Bot. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
