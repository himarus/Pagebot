const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate an image based on a prompt using the Flux API.',
  usage: 'flux <prompt>\nExample: flux cat',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\n\nExample: flux cat'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.jonelApi}/api/flux?prompt=${encodeURIComponent(prompt)}`;

    await sendMessage(senderId, { text: '✨ Generating your image... please wait a moment! ✨' }, pageAccessToken);

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
        text: 'Oops! Something went wrong while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
