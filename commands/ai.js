const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Ask anything to ChatGPT-4o',
  usage: 'ai <your question>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Please provide a prompt. Example: ai What is the capital of Japan?'
      }, pageAccessToken);
    }

    const apiUrl = `${api.josh}/api/chatgpt-4o-latest?uid=${senderId}&prompt=${encodeURIComponent(prompt)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

    try {
      const res = await axios.get(apiUrl);
      const reply = res.data?.response;

      if (!reply) throw new Error('No response from API.');

      await sendMessage(senderId, {
        text: reply
      }, pageAccessToken);
    } catch (error) {
      console.error('AI command error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error: Unable to get response from AI. Try again later. or try to use "ai2"'
      }, pageAccessToken);
    }
  }
};
