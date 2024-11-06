const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;
  const header = '⿻ | 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫 𝗔𝗜\n━━━━━━━━━━━━\n';
  const footer = '\n━━━━━━━━━━━━';

  const chunkSize = maxMessageLength - header.length - footer.length;
  const messages = splitMessageIntoChunks(text, chunkSize);

  for (const message of messages) {
    await new Promise(resolve => setTimeout(resolve, 300));
    await sendMessage(chilli, { text: `${header}${message}${footer}` }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'blackbox',
  description: 'Interact with the Blackbox API to receive responses based on a query.',
  usage: 'blackbox <query>',
  author: 'chilli',
  async execute(chilli, args, kalamansi) {
    if (!args || args.length === 0) {
      await sendMessage(chilli, {
        text: 'Please provide a query.\n\nExample: blackbox yokoso'
      }, kalamansi);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `${api.kaizen}/api/blackbox?q=${encodeURIComponent(query)}&uid=911`;

    await sendMessage(chilli, { text: 'Processing your request... Please wait.' }, kalamansi);

    try {
      const response = await axios.get(apiUrl);
      const { response: apiResponse } = response.data;

      await sendConcatenatedMessage(chilli, apiResponse, kalamansi);
      
    } catch (error) {
      console.error('Error with Blackbox API:', error);
      await sendMessage(chilli, {
        text: 'An error occurred while fetching the response. Please try again later.'
      }, kalamansi);
    }
  }
};
