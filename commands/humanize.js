const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'humanize',
  description: 'Get a human-like response from the AI.',
  usage: 'humanize <text>\nExample: humanize Hello there!',
  author: 'chilli',
  async execute(chilli, pogi, kupal) {
    if (!pogi || pogi.length === 0) {
      await sendMessage(chilli, {
        text: 'Please provide a text to humanize.\n\nUsage:\n humanize <text>\nExample: humanize Hello there!'
      }, kupal);
      return;
    }

    const text = pogi.join(' ');
    const apiUrl = `${api.jonelApi}/api/aihuman?text=${encodeURIComponent(text)}`;

    await sendMessage(chilli, { text: 'Humanizing your text, please wait...' }, kupal);

    try {
      const response = await axios.get(apiUrl);
      const { message, error } = response.data;

      if (error === "No") {
        await sendConcatenatedMessage(chilli, message, kupal);
      } else {
        await sendMessage(chilli, { text: 'An error occurred while processing your request. Please try again later.' }, kupal);
      }
      
    } catch (error) {
      console.error('Error in humanize command:', error);
      await sendMessage(chilli, { text: 'An error occurred while connecting to the API. Please try again later.' }, kupal);
    }
  }
};

async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
