const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); 

module.exports = {
  name: 'ai2',
  description: 'Get an AI-generated response to a query using the Mixtral-8B model.',
  usage: 'ai2 <query>\nExample: ai2 what is love',
  author: 'chilli',
  async execute(kupal, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(kupal, {
        text: 'Please provide a question.\n\nUsage:\nai2 <query>\nExample: ai2 what is love'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `${api.joshWebApi}/api/mixtral-8b?q=${encodeURIComponent(query)}`;

    await sendMessage(kupal, {
      text: 'Answering your question, please wait... 🤖'
    }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.result;

      if (result) {
        await sendMessage(kupal, { text: result }, pageAccessToken);
      } else {
        await sendMessage(kupal, {
          text: 'An error occurred while fetching the response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while generating the response. Please try again later.'
      }, pageAccessToken);
    }
  }
};
