const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'aesthetic',
  description: 'Generate an aesthetic-themed image based on provided text (max 5 letters).',
  author: 'chilli',
  execute(senderId, args, pageAccessToken) {
    const inputText = args.join(' ').trim();

    // Check if the input text exceeds the 5-letter limit
    if (inputText.length === 0) {
      return sendMessage(senderId, { text: '❌ Please provide a text input to generate an aesthetic image.' }, pageAccessToken);
    }

    if (inputText.length > 5) {
      return sendMessage(senderId, { text: `❌ The text must be 5 letters or fewer. Example: "vibes"` }, pageAccessToken);
    }

    const apiUrl = `${api.kenlie}/aesthetic?text=${encodeURIComponent(inputText)}`;

    // Send the generated image as an attachment
    axios.get(apiUrl)
      .then(() => {
        return sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: { url: apiUrl }
          }
        }, pageAccessToken);
      })
      .catch((error) => {
        console.error('Error generating aesthetic image:', error.message);
        return sendMessage(senderId, { text: '❌ Failed to generate the aesthetic image. Please try again later.' }, pageAccessToken);
      });
  }
};
