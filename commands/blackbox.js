const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'claude',
  description: 'Get a response from the Claude AI via Hazeyy\'s API.',
  usage: 'claude <message>\nExample: claude Hi',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(' ');

    if (!message || message.trim() === '') {
      await sendMessage(senderId, {
        text: ' Please provide a message.\n\nExample: claude Hi'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.hazey}/api/claude?message=${encodeURIComponent(message)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.claude) {
        const formattedResponse = `💬 *Claude's Response:*\n\n${response.data.claude}`;
        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in Claude command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
