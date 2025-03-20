const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate an image based on the provided text using Hazey API.',
  usage: 'flux <text>',
  author: 'your_name',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide the text for image generation. Example: flux A beautiful sunset.' }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const apiUrl = `${api.hazey}/api/fluxx?text=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.imageUrl) {
        await sendMessage(senderId, { 
          attachment: { 
            type: 'image', 
            payload: { url: response.data.imageUrl } 
          } 
        }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in flux command:', error.message || error);
      await sendMessage(senderId, { text: 'Error: Could not generate image. Please try again later.' }, pageAccessToken);
    }
  }
};
