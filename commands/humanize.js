const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'humanize',
  description: 'Get a humanized AI response',
  usage: 'humanize <text>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a message to humanize. Example: humanize hatdog' }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const apiUrl = `${api.jonel}/api/aihuman?text=${encodeURIComponent(text)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.error?.toLowerCase() === 'no') {
        const reply = `🗣️ ${data.message}\n\n💬 ${data.message2}`;
        await sendMessage(senderId, { text: reply }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: '⚠️ An error occurred. Please try again later.' }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error in humanize command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ Failed to get humanized response.' }, pageAccessToken);
    }
  }
};
