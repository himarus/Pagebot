const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generate AI art based on a given prompt.',
  usage: 'imagine <prompt>\nExample: imagine dog and cat',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: '❗ Please provide a prompt to generate art.\n\nExample: imagine dog and cat'
      }, pageAccessToken);
    }

    const apiUrl = `https://ccprojectapis.ddns.net/api/generate-art?prompt=${encodeURIComponent(prompt)}`;

    await sendMessage(senderId, { text: `🎨 Generating art for the prompt: "${prompt}"... Please wait.` }, pageAccessToken);

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);
    } catch {
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while generating the art. Please try again later.'
      }, pageAccessToken);
    }
  }
};
