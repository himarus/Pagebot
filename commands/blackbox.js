const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'blackbox',
  description: 'Get an insightful response from Blackbox based on a query.',
  usage: 'blackbox <query>\nExample: blackbox what is love?',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a query.\n\nExample: blackbox what is love?'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `${api.kaizen}/api/blackbox?q=${encodeURIComponent(query)}&uid=199`;

    await sendMessage(senderId, { text: '𝘚𝘦𝘢𝘳𝘤𝘩𝘪𝘯𝘨 𝘗𝘭𝘦𝘢𝘴𝘦𝘸𝘢𝘪𝘵...' }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const { response: answer } = response.data;

      // Log the answer length to check if chunking is needed
      console.log(`Answer length: ${answer.length}`);

      await sendConcatenatedMessage(senderId, answer, pageAccessToken);
    } catch (error) {
      console.error('Error fetching response from Blackbox:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing your query. Please try again later.'
      }, pageAccessToken);
    }
  }
};

// Helper functions
async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;

  // If the message is too long, split it
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    console.log(`Message is too long. Splitting into ${messages.length} chunks.`);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));  // Delay between chunks
      await sendMessage(chilli, { text: message }, kalamansi);
    }
  } else {
    await sendMessage(chilli, { text }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
