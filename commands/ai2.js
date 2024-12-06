const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai2',
  description: 'Get an AI response using a different API.',
  usage: 'ai2 <query>\nExample: ai2 Tell me a joke.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query || query.trim() === '') {
      await sendMessage(senderId, {
        text: '❗ Please provide a query to ask the AI.\n\nExample: ai2 Tell me a joke.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.mark2}/new/gpt4?query=${encodeURIComponent(query)}`;

    try {
      await sendMessage(senderId, { text: `🤔 Thinking about: "${query}"... Please wait.` }, pageAccessToken);

      const response = await axios.get(apiUrl);

      if (response.data && response.data.respond) {
        const aiResponse = response.data.respond; // Get the AI response
        await sendMessage(senderId, { text: `🤖 AI2 Response:\n\n${aiResponse}` }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }

    } catch (error) {
      console.error('Error in AI2 command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ API error occurred. Please try again later or use "ai2".'
      }, pageAccessToken);
    }
  }
};
