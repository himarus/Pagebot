const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'deepseek',
  description: 'Get a response from DeepSeek AI.',
  usage: 'deepseek <question>\nExample: deepseek What is AI?',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, { text: 'Please provide a question.' }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.jonel}/api/deepseek?ask=${encodeURIComponent(question)}&id=${encodeURIComponent(senderId)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.message) {
        await sendMessage(senderId, { text: response.data.message }, pageAccessToken);
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
