const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'humanize',
  description: 'Convert AI-generated text into human-like text using Kaizen\'s API.',
  usage: 'humanizer <text>\nExample: humanizer This is an AI-generated sentence.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const text = args.join(' ');

    if (!text || text.trim() === '') {
      await sendMessage(senderId, {
        text: '📝 Please provide a text to humanize.\n\nExample: humanizer This is an AI-generated sentence.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/humanizer?q=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        const resultMessage = 
          `🔹 *AI to Human Text Conversion* 🔹\n\n` +
          `💻 *AI Text:* ${text}\n` +
          `📝 *Humanized Version:* ${response.data.response}\n\n` +
          `✅ *Your text now sounds more natural!*`;

        await sendMessage(senderId, { text: resultMessage }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in Humanizer command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
