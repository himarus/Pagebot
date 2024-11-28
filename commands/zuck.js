const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'zuck',
  description: 'Generate a Mark Zuckerberg image with custom text.',
  usage: 'zuck <text>\nExample: zuck Hello, world!',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: '❗ Please provide text to generate the Zuck image.\n\nExample: zuck Hello, world!'
      }, pageAccessToken);
      return;
    }

    const inputText = args.join(' ');
    const apiUrl = `${api.kenlie2}/zuck?text=${encodeURIComponent(inputText)}`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in Zuck command:', error.message);
      await sendMessage(senderId, {
        text: '🚧 An error occurred while generating the Zuck image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
