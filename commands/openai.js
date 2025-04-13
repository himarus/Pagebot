const axios = require('axios');
const FormData = require('form-data');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'openai',
  description: 'Generate audio from OpenAI voice model.',
  usage: 'openai <message>',
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
      const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(audioResponse.data);

      const form = new FormData();
      form.append('recipient', JSON.stringify({ id: chilli }));
      form.append('message', JSON.stringify({
        attachment: {
          type: 'audio',
          payload: {}
        }
      }));
      form.append('filedata', audioBuffer, {
        filename: 'voice.mp3',
        contentType: 'audio/mpeg'
      });

      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pogi}`,
        form,
        { headers: form.getHeaders() }
      );

    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      await sendMessage(chilli, {
        text: '⚠️ Failed to send audio. Make sure the text is valid and try again.'
      }, pogi);
    }
  }
};
