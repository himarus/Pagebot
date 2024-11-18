const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'voice',
  description: 'Generate a voice audio clip from text input using AI Voice API.',
  usage: 'voice <text> | <id>\nExample: voice Hello, how are you? | 3\nVoice ID range: 1-8',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|');
    const text = input[0]?.trim();
    let id = input[1] ? parseInt(input[1].trim(), 10) : 8;

    const maxLength = 200; // Define a maximum character limit for the text

    if (!text || text === '') {
      await sendMessage(senderId, {
        text: '❗ Please provide text to generate a voice clip.\n\nExample: voice Hello, how are you? | 3\nYou can choose Id from: 1 to 8'
      }, pageAccessToken);
      return;
    }

    if (text.length > maxLength) {
      await sendMessage(senderId, {
        text: `❗ The text is too long! Please limit your message to ${maxLength} characters.\n\nYour text is ${text.length} characters long.`
      }, pageAccessToken);
      return;
    }

    if (isNaN(id) || id < 1 || id > 8) {
      await sendMessage(senderId, {
        text: '❗ The voice ID must be between 1 and 8. Defaulting to 8.\n\nAvailable IDs: 1-8'
      }, pageAccessToken);
      id = 8;
    }

    const apiUrl = `${api.joshWebApi}/api/aivoice?q=${encodeURIComponent(text)}&id=${id}`;

    try {
      await sendMessage(senderId, {
        text: `🎙️ Generating voice for: "${text}" using voice ID ${id}... Please wait.`
      }, pageAccessToken);

      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: apiUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in voice command:', error.message || error);
      const errorMsg = error.response?.data?.error || '⚠️ An error occurred while generating the voice clip.';
      await sendMessage(senderId, {
        text: `${errorMsg}\nPlease try again later.`
      }, pageAccessToken);
    }
  }
};
