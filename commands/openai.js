const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'openai',
  description: 'Generate audio using OpenAI voice based on a prompt',
  usage: 'openai <message>',
  author: 'chillibot',

  async execute(chilli, args, pogi) {
    const query = args.join(' ');

    if (!query || query.trim() === '') {
      await sendMessage(chilli, {
        text: 'Please enter a message to convert to audio.\n\nExample: openai Paano kung magmahal ka ng taong bawal mahalin?'
      }, pogi);
      return;
    }

    const encoded = encodeURIComponent(query);
    const apiUrl = `https://text.pollinations.ai/${encoded}?model=openai-audio&voice=ash`;

    try {
      // Optional: HEAD check kung gusto mo pa rin i-log content-type
      const head = await axios.head(apiUrl);
      console.log('Content-Type:', head.headers['content-type']); // Debug lang

      // Diretso send audio, kahit anong content-type
      await sendMessage(chilli, {
        attachment: {
          type: 'audio',
          payload: {
            url: apiUrl
          }
        }
      }, pogi);
    } catch (err) {
      console.error('Error:', err.message);
      await sendMessage(chilli, {
        text: '⚠️ Something went wrong. Try again with a different prompt.'
      }, pogi);
    }
  }
};
