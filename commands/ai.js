const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Get an AI-powered response to your query.',
  usage: 'ai <question>\nExample: ai What is the capital of France?',
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: '❗ Please provide a question to ask the AI.\n\nExample: ai What is the capital of France?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.heru}/api/gpt-4o?prompt=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.content) {
        const aiResponse = response.data.content;
        await sendMessage(senderId, { text: aiResponse }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }

    } catch (error) {
      console.error('Error in AI command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
