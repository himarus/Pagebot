const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'art',
  description: 'Generate AI art from a prompt using Midjourney',
  usage: 'art <prompt>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Please provide a prompt for the artwork. Example: art futuristic city'
      }, pageAccessToken);
    }

    // Indicator message
    await sendMessage(senderId, {
      text: `🎨 Generating your image for: "${prompt}"\nPlease wait a few moments...`
    }, pageAccessToken);

    const apiUrl = `${api.josh}/api/midjourney?prompt=${encodeURIComponent(prompt)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

    try {
      const res = await axios.get(apiUrl);

      if (!res.data || res.data.status !== true || !res.data.images?.length) {
        throw new Error('Failed to generate image.');
      }

      for (const imageUrl of res.data.images) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Art command error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error: Unable to generate artwork. Try again with a different prompt.'
      }, pageAccessToken);
    }
  }
};
