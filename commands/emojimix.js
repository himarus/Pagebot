const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');
const axios = require('axios');

module.exports = {
  name: 'emojimix',
  description: 'Mix two emojis into one image using Kaizen API',
  usage: 'emojimix <emoji1><emoji2>\nExample: emojimix 😂😃 or emojimix 😂 😃',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide two emojis.\nExample: emojimix 😂😃'
      }, pageAccessToken);
      return;
    }

    const joined = args.join('');
    const splitEmojis = [...joined];

    if (splitEmojis.length < 2) {
      await sendMessage(senderId, {
        text: 'Please provide at least 2 emojis to mix.'
      }, pageAccessToken);
      return;
    }

    const [emoji1, emoji2] = splitEmojis;
    const baseUrl = api.kaizen.base;
    const apikey = api.kaizen.key;

    try {
      const res = await axios.get(`${baseUrl}/api/emojimix`, {
        params: {
          emoji1,
          emoji2,
          apikey
        }
      });

      const { image } = res.data;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: image,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in emojimix command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Failed to generate emojimix image. Try different emojis.'
      }, pageAccessToken);
    }
  }
};
