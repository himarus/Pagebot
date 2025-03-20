const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai2',
  description: 'Get a response from Gemini AI via Hazeyy\'s API.',
  usage: 'ai2 <question>\nExample: ai2 What is AI?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a question.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.hazey}/api/gemini?question=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.gemini) {
        await sendMessage(senderId, { text: response.data.gemini }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in AI2 command try to use claude:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
