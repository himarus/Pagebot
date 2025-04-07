const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'copilot',
  description: 'Ask Copilot anything and get a helpful response',
  usage: 'copilot <your question>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Please provide a prompt. Example: copilot What is JavaScript?'
      }, pageAccessToken);
    }

    const apiUrl = `${api.josh}/api/copilot?prompt=${encodeURIComponent(prompt)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

    try {
      const res = await axios.get(apiUrl);
      const reply = res.data?.result;

      if (!reply) throw new Error('No response from API.');

      await sendMessage(senderId, {
        text: reply
      }, pageAccessToken);
    } catch (error) {
      console.error('Copilot command error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error: Unable to get a response from Copilot. Try again later.'
      }, pageAccessToken);
    }
  }
};
