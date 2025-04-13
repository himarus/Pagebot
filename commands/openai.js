const axios = require('axios');
const FormData = require('form-data');
const { sendMessage } = require('../handles/sendMessage');

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
      // Get the audio as a buffer
      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer'
      });

      const buffer = Buffer.from(response.data);
      const form = new FormData();
      form.append('recipient', JSON.stringify({ id: chilli }));
      form.append('message', JSON.stringify({
        attachment: {
          type: 'audio',
          payload: {}
        }
      }));
      form.append('filedata', buffer, {
        filename: 'voice.mp3',
        contentType: 'audio/mpeg'
      });

      // Send directly to FB Messenger Send API
      await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${pogi}`, form, {
        headers: form.getHeaders()
      });

    } catch (error) {
      console.error('Upload error:', error?.response?.data || error.message);
      await sendMessage(chilli, {
        text: '⚠️ Failed to send audio. The API might not be returning a valid file or Facebook rejected the upload.'
      }, pogi);
    }
  }
};
