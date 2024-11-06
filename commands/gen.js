const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); // Ensure you have the correct import for the api object

module.exports = {
  name: 'gen',
  description: 'Generate an image based on a prompt using the JoshWeb AI image generator.',
  usage: 'gen <prompt>\nExample: gen dog with its owner',
  author: 'chilli',
  async execute(kupal, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(kupal, {
        text: 'Please provide a prompt.\n\nex: gen dog with its owner'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.joshWebApi}/aigen?prompt=${encodeURIComponent(prompt)}`;

    await sendMessage(kupal, {
      text: `Generating image for prompt: "${prompt}"... Please wait.`
    }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.result;

      if (imageUrl) {
        await sendMessage(kupal, {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(kupal, {
          text: 'An error occurred while generating the image. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
