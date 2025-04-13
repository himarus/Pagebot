const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'openai',
  description: 'Convert text to speech using OpenAI Audio API',
  usage: 'openai <text>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const text = args.join(' ');

    if (!text) {
      await sendMessage(senderId, { 
        text: '❌ Please provide the text to convert to audio.\nExample: openai I love you but it’s forbidden' 
      }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=ash`;
      
      await sendMessage(senderId, {
        attachment: {
          type: "audio",
          payload: {
            url: apiUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('OpenAI Audio Error:', error);
      await sendMessage(senderId, {
        text: '⚠️ Error converting text to audio. Please try again later.'
      }, pageAccessToken);
    }
  }
};
