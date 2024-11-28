const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai2',
  description: 'Get an AI-generated response to a query using GPT-4.',
  author: 'chilli',

  async execute(kupal, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(kupal, {
        text: '❗ Please provide a question.'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `${api.jonelApi}/api/gpt4o?ask=${encodeURIComponent(query)}&id=1`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        await sendMessage(kupal, { text: result }, pageAccessToken);
      } else {
        throw new Error("Empty response from API.");
      }

    } catch (error) {
      const errorMessage = error.response?.data || error.message || "An unknown error occurred.";
      console.error('Error generating response:', errorMessage);
      await sendMessage(kupal, {
        text: `⚠️ **API Error:** try to use blackbox\n${JSON.stringify(errorMessage, null, 2)}`
      }, pageAccessToken);
    }
  }
};
