const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'humanize',
  description: 'Humanize your message using Kaizen API.',
  usage: 'humanize <message>\nExample: humanize How are you?',
  author: 'kaizen',

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(' ');

    if (!message || message.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a message to humanize.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/humanizer?q=${encodeURIComponent(message)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        await sendMessage(senderId, {
          text: response.data.response
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Unable to humanize the message. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`
      }, pageAccessToken);
    }
  }
};
