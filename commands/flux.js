const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate an image based on the given prompt.',
  usage: 'flux <prompt>\nExample: flux dog half cat',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\nExample: flux dog half cat'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.kenlie}/fluxv2/?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            is_reusable: true
          }
        },
        file: imageBuffer
      }, pageAccessToken);

    } catch (error) {
      console.error('Error fetching image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
