const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'voice',
  description: 'Generate a voice audio clip from text input using AI Voice API.',
  usage: 'voice <text>\nExample: voice Hello, how are you?',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: '❗ Please provide text to generate a voice clip.\n\nExample: voice Hello, how are you?'
      }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const voiceId = 8; // You can change this if needed (1-8 available IDs).
    const apiUrl = `https://joshweb.click/api/aivoice?q=${encodeURIComponent(text)}&id=${voiceId}`;

    try {
      // Notify the user that processing is happening
      await sendMessage(senderId, {
        text: `🎙️ Generating voice for: "${text}"... Please wait.`
      }, pageAccessToken);

      // Fetch the voice audio
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      // Convert the response to a base64-encoded string for voice attachment
      const audioData = Buffer.from(response.data, 'binary').toString('base64');

      // Send the voice clip
      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: `data:audio/mp3;base64,${audioData}`,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in voice command:', error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while generating the voice clip. Please try again later.'
      }, pageAccessToken);
    }
  }
};
