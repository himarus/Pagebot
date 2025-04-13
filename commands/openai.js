const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'openai',
  description: 'Generate AI voice using OpenAI model from Pollinations API',
  usage: 'openai <message>',
  author: 'chill',

  async execute(chilli, args, pogi) {
    const search = args.join(' ');

    if (!search || search.trim() === '') {
      await sendMessage(chilli, {
        text: 'Please enter a message to convert to audio.\n\nExample: openai Paano kung magmahal ka ng taong bawal mahalin?'
      }, pogi);
      return;
    }

    const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(search)}?model=openai-audio&voice=ash`;

    try {
      const checkAudio = await axios.head(audioUrl);
      const type = checkAudio.headers['content-type'] || '';

      if (type.includes('audio')) {
        await sendMessage(chilli, {
          attachment: {
            type: 'audio',
            payload: {
              url: audioUrl
            }
          }
        }, pogi);
      } else {
        await sendMessage(chilli, {
          text: `⚠️ No audio was returned from the API. Please try a different prompt.`
        }, pogi);
      }
    } catch (error) {
      await sendMessage(chilli, {
        text: '⚠️ Failed to get audio. Please try again or use a simpler message.'
      }, pogi);
    }
  }
};
