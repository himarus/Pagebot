const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'deepseekr1',
  description: 'Get a response from DeepSeek AI using Kaizen\'s API.',
  usage: 'deepseek <question>\nExample: deepseek What is AI?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: '📝 Please provide a question.\n\nExample: deepseek What is AI?'
      }, pageAccessToken);
      return;
    }

    // Indicator message before getting the response
    await sendMessage(senderId, { text: '💬 Answering your question...' }, pageAccessToken);

    const apiUrl = `${api.kaizen}/api/deepseek-r1?ask=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        await sendMessage(senderId, { text: response.data.response }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in DeepSeek command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
