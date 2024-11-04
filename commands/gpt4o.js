const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'gpt4o',
  description: 'Ask GPT-4o for a response to a given query',
  usage: 'gpt4o <query>',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a query for GPT-4o.' }, pageAccessToken);
      return;
    }

    const query = args.join(' ');

    try {
      const apiUrl = `${api.joshWebApi}/api/gpt-4o?q=${encodeURIComponent(query)}&uid=1`;
      const response = await axios.get(apiUrl);
      const result = response.data.result;

      if (response.data.status && result) {
        await sendConcatenatedMessage(senderId, result, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Error: GPT-4o could not provide a response.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'An error occurred while getting a response from GPT-4o.' }, pageAccessToken);
    }
  }
};

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));  // Delay between chunks
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
