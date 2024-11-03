const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'egif',
  description: 'Convert an emoji into a GIF.',
  usage: 'egif <emoji>\nExample: egif 🥺',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide an emoji to convert to a GIF.\n\nUsage:\n egif <emoji>\nExample: egif 🥺'
      }, pageAccessToken);
      return;
    }

    const emoji = args.join(' ');
    const apiUrl = `${api.joshWebApi}/emoji2gif?q=${encodeURIComponent(emoji)}`;

    await sendMessage(senderId, { text: 'Converting emoji to GIF... Please wait.' }, pageAccessToken);

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
      console.error('Error converting emoji to GIF:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while converting the emoji to GIF. Please try again later.'
      }, pageAccessToken);
    }
  }
};
