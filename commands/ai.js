const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'bitcanything',
  usage: 'ai <question>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a question. Example: ai What is AI?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.hazey}/api/perplexity?q=${encodeURIComponent(question)}`;

    try {
      const res = await axios.get(apiUrl);
      const { perplexity } = res.data;

      if (!perplexity) throw new Error('No response returned.');

      await sendMessage(senderId, {
        text: perplexity
      }, pageAccessToken);
    } catch (error) {
      console.error('Hazey AI error:', error.response?.data || error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ Error: ${error.response?.data?.message || error.message || 'Unknown error occurred.'}`
      }, pageAccessToken);
    }
  }
};
