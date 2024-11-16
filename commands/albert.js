const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'albert',
  description: 'Generate an Albert Einstein image with custom text.',
  usage: 'albert <text>\nExample: albert Hello, world!',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: '❗ Please provide text to generate the Albert image.\n\nExample: albert Hello, world!'
      }, pageAccessToken);
      return;
    }

    const inputText = args.join(' ');
    const apiUrl = `${api.kenlie}/albert?text=${encodeURIComponent(inputText)}`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in Albert command:', error.message);
      await sendMessage(senderId, {
        text: '🚧 An error occurred while generating the Albert image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

