const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Get an AI-powered response to your query.',
  usage: 'ai <question>\nExample: ai How are you?',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, { text: 'Please provide a question.' }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/gpt4o-mini?ask=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        await sendMessage(senderId, { text: response.data.response }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in AI command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. You can try using "ai2" or retry the command.`
      }, pageAccessToken);
    }
  }
};
