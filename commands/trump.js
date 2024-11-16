const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'trump',
  description: 'Generate a Donald Trump image with custom text.',
  usage: 'trump <text>\nExample: trump Hello, world!',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: '❗ Please provide text to generate the Trump image.\n\nExample: trump Hello, world!'
      }, pageAccessToken);
      return;
    }

    const inputText = args.join(' ');
    const apiUrl = `${api.kenlie}/trump?text=${encodeURIComponent(inputText)}`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in Trump command:', error.message);
      await sendMessage(senderId, {
        text: '🚧 An error occurred while generating the Trump image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
