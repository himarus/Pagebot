const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'art',
  description: 'Generate AI art images based on a prompt.',
  usage: 'imagegen <prompt>\nExample: imagegen girl with flowers',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, {
        text: '❗ Please provide a prompt to generate an image.\n\nExample: art girl with flowers'
      }, pageAccessToken);
    }

    const prompt = args.join(' ');
    const apiUrl = `https://api.kenliejugarap.com/turbo-image-gen/?width=1024&height=1024&prompt=${encodeURIComponent(prompt)}`;

    await sendMessage(senderId, { text: `🎨 Generating image for: "${prompt}"... Please wait.` }, pageAccessToken);

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
      console.error('Error in imagegen command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
