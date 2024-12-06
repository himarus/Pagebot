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
        text: 'Please provide a question.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kenlie}/mistral-large/?question=${encodeURIComponent(question)}`;

    try {
      await sendMessage(senderId, { text: `🤖 Thinking about: "${question}"... Please wait.` }, pageAccessToken);

      const response = await axios.get(apiUrl);

      if (response.data && response.data.status && response.data.response) {
        const aiResponse = response.data.response; // Get the AI response
        await sendMessage(senderId, { text: `🧠 AI Response:\n\n${aiResponse}` }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }

    } catch (error) {
      console.error('Error in AI command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ API error occurred. Please try again later or use "ai".'
      }, pageAccessToken);
    }
  }
};
