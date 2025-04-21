const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); 

module.exports = {
  name: 'ai',
  description: 'using Hazey API',
  usage: 'ai <your message>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, {
        text: 'Please enter a message to send to the AI.\n\nExample: ai hi'
      }, pageAccessToken);
    }

    const userMessage = args.join(' ');
    const apiUrl = `${api.hazey}/api/openchat?message=${encodeURIComponent(userMessage)}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data?.openchat || "Sorry, I couldn't get a response.";

      await sendMessage(senderId, {
        text: reply
      }, pageAccessToken);

    } catch (error) {
      console.error("AI Command Error:", error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ Error fetching AI response: ${error.message} try to use ai2 || 'Unknown error try to use ai2'}`
      }, pageAccessToken);
    }
  }
};
