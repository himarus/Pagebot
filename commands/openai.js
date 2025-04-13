const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const { Readable } = require('stream');

module.exports = {
  name: 'openai',
  description: 'Generate audio from OpenAI voice',
  usage: 'openai <text>',
  author: 'chillibot',

  async execute(chilli, args, pogi) {
    const prompt = args.join(' ');

    if (!prompt) {
      await sendMessage(chilli, {
        text: 'Please enter a message to convert to audio.\n\nExample: openai Paano kung magmahal ka ng taong bawal mahalin?'
      }, pogi);
      return;
    }

    const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-audio&voice=ash`;

    try {
      // Download as buffer
      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer'
      });

      const audioBuffer = Buffer.from(response.data);

      // Convert buffer to Readable stream (required by FB API)
      const stream = Readable.from(audioBuffer);

      await sendMessage(chilli, {
        attachment: {
          type: 'audio',
          payload: {
            is_reusable: true
          }
        },
        filedata: stream
      }, pogi);
    } catch (err) {
      console.error('Audio download/upload failed:', err.message);
      await sendMessage(chilli, {
        text: '⚠️ Failed to get audio. Try again later or change your prompt.'
      }, pogi);
    }
  }
};
