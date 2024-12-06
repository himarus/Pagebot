const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Get an AI-powered response to your query.',
  usage: 'ai <question>\nExample: ai What is the capital of France?',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: '❗ Please provide a question to ask the AI.\n\nExample: ai What is the capital of France?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kenlie2}/mistral-large/?question=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.status && response.data.response) {
        const aiResponse = response.data.response; // Get the AI response
        await sendMessage(senderId, { text: aiResponse }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }

    } catch (error) {
      console.error('Error in AI command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ AI command is currently having issues. Please use the "ai2" command instead.'
      }, pageAccessToken);
    }
  }
};
