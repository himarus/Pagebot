const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generate AI art based on a given prompt.',
  usage: 'imagine <prompt>\nExample: imagine dog and cat',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      await sendMessage(senderId, {
        text: '❗ Please provide a prompt to generate art.\n\nExample: imagine dog and cat'
      }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, { text: `🎨 Generating art for the prompt: "${prompt}"... Please wait.` }, pageAccessToken);

    const apiUrl = `https://ccprojectapis.ddns.net/api/generate-art?prompt=${encodeURIComponent(prompt)}`;

    try {
      // Make a request to the API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      
      // Check if the response is valid
      if (!response || response.status !== 200) {
        throw new Error('Invalid response from API');
      }

      const imageUrl = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;

      // Send the generated image back to the user
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error generating art:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while generating the art. Please try again later.'
      }, pageAccessToken);
    }
  }
};
