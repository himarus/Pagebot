const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate an image based on a prompt using the JoshWeb Flux API (models 1 to 5).',
  usage: 'flux <prompt> [model]\nExample: flux cat 3',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\n\nUsage:\n flux <prompt> [model]\nExample: flux cat 3'
      }, pageAccessToken);
      return;
    }

    const prompt = args[0];
    const model = args[1] && !isNaN(args[1]) && args[1] >= 1 && args[1] <= 5 ? args[1] : 4;
    const fluxApiUrl = `${api.joshWebApi}/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

    await sendMessage(senderId, { text: 'Generating image... Please wait.' }, pageAccessToken);

    try {
      // Fetch image generation request from Flux API
      await axios.get(fluxApiUrl);

      // Manually construct the image URL for Flux API based on the prompt and model
      const imageUrl = `${api.joshWebApi}/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

      // Process image through Litterbox API
      const litterboxApiUrl = 'https://nethwieginedev.vercel.app/api/litterbox';
      const litterboxResponse = await axios.post(litterboxApiUrl, { url: imageUrl });
      const litterboxImageUrl = litterboxResponse.data.url;

      // Send the final image as an attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: litterboxImageUrl
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
