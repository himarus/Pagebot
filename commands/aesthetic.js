const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'aesthetic',
  description: 'Generate an aesthetic text image.',
  usage: 'aesthetic <text>\nExample: aesthetic Hello, world!',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: '❗ Please provide text to generate the aesthetic image.\n\nExample: aesthetic Hello, world!'
      }, pageAccessToken);
      return;
    }

    const inputText = args.join(' ');
    const apiUrl = `${api.kenlie}/aesthetic?text=${encodeURIComponent(inputText)}`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in Aesthetic command:', error.message);
      await sendMessage(senderId, {
        text: '🚧 An error occurred while generating the aesthetic image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
