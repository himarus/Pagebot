const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  command: 'flux',
  description: 'Generate an image based on a prompt using the Kenlie API.',
  usage: 'flux <prompt>\nExample: flux dog half cat',
  author: 'chilli',
  async execute(context, args) {
    const senderId = context.sender.id;
    const pageAccessToken = context.pageAccessToken;

    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\nExample: flux dog half cat'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.kenlie}/fluxv2/?prompt=${encodeURIComponent(prompt)}`;

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
