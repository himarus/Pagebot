const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'gojo',
  description: 'Chat with Gojo Satoru using Kaizen API.',
  usage: 'gojo <question>\nExample: gojo What is jujutsu?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a question for Gojo.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/gojo-ai?question=${encodeURIComponent(question)}&uid=${senderId}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        const { response: gojoResponse } = response.data;

        await sendMessage(senderId, {
          text: `👓 *Gojo Satoru says:*\n\n${gojoResponse}`
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Unable to fetch a response from Gojo. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
