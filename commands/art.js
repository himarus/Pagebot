const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'art',
  description: 'Generate an image based on a prompt using the JoshWeb API.',
  usage: 'art <prompt>\nExample: art dog',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\nExample: art dog'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.joshWebApi}/api/art?prompt=${encodeURIComponent(prompt)}`;

    await sendMessage(senderId, { text: 'Generating image... Please wait.' }, pageAccessToken);

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
