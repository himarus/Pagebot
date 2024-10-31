const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate a futuristic image using the JoshWeb API with an optional model parameter.',
  usage: 'flux <prompt> [model]\nExample: flux dog and cat\nExample with model: flux sunset 3',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\n\nUsage:\n flux <prompt> [model]\nExample: flux dog and cat\nExample with model: flux sunset 3'
      }, pageAccessToken);
      return;
    }

    const prompt = args.slice(0, -1).join(' ');
    const model = isNaN(args[args.length - 1]) ? 4 : args.pop();
    const apiUrl = `${api.joshWebApi}/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

    await sendMessage(senderId, { text: 'Generating image... This may take a few moments. Please wait.' }, pageAccessToken);

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
