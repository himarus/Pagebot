const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'emojimix',
  description: 'Combine two emojis into a single image using the Emojimix API.',
  usage: 'emojimix <emoji1> <emoji2>\nExample: emojimix 💀 🥶',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length < 2) {
      await sendMessage(senderId, {
        text: 'Please provide two emojis to combine.\n\nExample: emojimix 💀 🥶'
      }, pageAccessToken);
      return;
    }

    const [emoji1, emoji2] = args;
    const apiUrl = `https://betadash-uploader.vercel.app/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;

    await sendMessage(senderId, { text: '✨ Creating your emojimix... please wait! ✨' }, pageAccessToken);

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
      console.error('Error generating emojimix:', error);
      await sendMessage(senderId, {
        text: 'Oops! Something went wrong while creating the emojimix. Please try again later.'
      }, pageAccessToken);
    }
  }
};
