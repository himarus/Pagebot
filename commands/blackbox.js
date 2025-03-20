const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'blackbox',
  description: 'AI model for complex problem-solving and decision-making.',
  usage: 'blackbox <question>\nExample: blackbox How do I optimize my workflow?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: '🧠 *BLACKBOX AI*\n\n🔍 *Enter a complex problem to solve!*\n\n📌 Example: blackbox How do I optimize my workflow?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.yakzy}/blackbox?ask=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.Response) {
        const resultMessage = 
          `𖣘 BLACKBOX AI 𖣘\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          ` ${response.data.Response} `;

        await sendMessage(senderId, { text: resultMessage }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in Blackbox command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
