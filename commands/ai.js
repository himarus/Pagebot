const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Interact with ChatGPT-4o mini by Hazeyy.',
  usage: 'ai <message>\nExample: ai How do I learn JavaScript?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(' ');

    if (!message || message.trim() === '') {
      await sendMessage(senderId, {
        text: '✦ *GPT-4o Mini*\n\n💬 *Enter a message to chat with AI!*\n\n📌 Example: ai How do I learn JavaScript?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.hazey}/model1?message=${encodeURIComponent(message)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.models) {
        await sendMessage(senderId, { text: response.data.models }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in AI command try to use chilli or ai2 or deepseekr1:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
