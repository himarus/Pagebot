const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'chilli',
  description: 'Ask questions using Brave AI by Kaizenji.',
  usage: 'chilli <question>\nExample: chilli What is AI?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: '🌶 *Chilli AI - Brave Intelligence* 🌶\n\n💬 *Enter a question to get AI-generated insights!*\n\n📌 Example: chilli What is AI?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/brave-ai?ask=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        const formattedResponse = `🔥 *Chilli AI - Brave Response* 🔥\n\n💬 *Question:* ${question}\n🧠 *AI Says:* ${response.data.response}`;
        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in Chilli command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
