const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); // Import API configuration

module.exports = {
  name: 'ai',
  description: 'Chat with Learnlm 1.5 Pro Exp (With Previous Conversation)',
  usage: 'ai <message>',
  author: 'Churchill',

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(' ');

    if (!message || message.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a message. Example: ai Hello!'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.hazey}/api/gemini5?message=${encodeURIComponent(message)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.chat) {
        await sendMessage(senderId, { text: response.data.chat }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in AI command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
