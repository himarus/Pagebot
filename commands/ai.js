const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Ask something to Zaik AI',
  usage: 'ai <question>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, { text: 'Please provide a question.\n\nExample: ai what is solar system<' }, pageAccessToken);
    }

    const prompt = args.join(' ');
    const uid = senderId;
    const apiUrl = `${api.zaik}/api/sonar-r-pro?prompt=${encodeURIComponent(prompt)}&uid=${uid}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data.reply || 'No reply received from AI.';

      await sendMessage(senderId, { text: reply }, pageAccessToken);
    } catch (error) {
      await sendMessage(senderId, { text: 'Error: Unable to fetch response from AI Please Try to use ai2.' }, pageAccessToken);
    }
  }
};
