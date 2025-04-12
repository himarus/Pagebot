const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'openai',
  description: 'Generate a voice response using OpenAI voice model via Pollinations',
  usage: 'openai <text>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');

    if (!prompt || prompt.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please enter a message. Example: openai What if you fall in love with someone you cannot have?'
      }, pageAccessToken);
      return;
    }

    // Encode prompt
    const encodedPrompt = encodeURIComponent(prompt);
    const voice = 'ash';
    const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=openai-audio&voice=${voice}`;

    try {
      // Check if URL returns audio
      const checkAudio = await axios.head(apiUrl);
      const type = checkAudio.headers['content-type'] || '';

      if (type.includes('audio')) {
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: apiUrl
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ No audio was returned from the API. Please try a different prompt.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("OpenAI audio error:", error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error generating audio. Please try again later or use a different text.'
      }, pageAccessToken);
    }
  }
};
