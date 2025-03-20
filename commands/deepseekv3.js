const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'deepseekv3',
  description: 'Ask questions using DeepSeek-V3 AI.',
  usage: 'deepseekv3 <question>\nExample: deepseekv3 What is the meaning of life?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: '🤖 Ask me something!\n\nExample: deepseekv3 What is the meaning of life?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/deepseek-v3?ask=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        const resultMessage = 
          `💡 DeepSeek-V3 AI Response\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🗨️ *${response.data.response}*`;

        await sendMessage(senderId, { text: resultMessage }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in DeepSeek-V3 command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
