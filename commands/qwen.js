const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'qwen',
  description: 'Chat with Qwen Max Latest by Hazeyy.',
  usage: 'qwen <message>\nExample: qwen What can you do?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(' ');

    if (!message || message.trim() === '') {
      await sendMessage(senderId, {
        text: '💬 Please enter a message to chat with Qwen.\n\nExample: qwen What can you do?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.hazey}/api/qwenm?message=${encodeURIComponent(message)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.qwen) {
        await sendMessage(senderId, { text: response.data.qwen }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in Qwen command try to use other ai cmd:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
