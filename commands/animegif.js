const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); // Assuming api.rapid is defined here

module.exports = {
  name: 'animegif',
  description: 'Send a random anime GIF',
  usage: 'animegif',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const apiUrl = `${api.rapid}/api/animegif`;

    try {
      // Inform user that the bot is fetching the gif
      await sendMessage(senderId, {
        text: '[⏳] Fetching a random anime GIF for you...'
      }, pageAccessToken);

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data || !data.url) {
        return sendMessage(senderId, { text: 'Sorry, no anime GIF found at the moment.' }, pageAccessToken);
      }

      // Send the anime GIF as an image attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: data.url
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error fetching animegif:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error fetching anime GIF. Please try again later.'
      }, pageAccessToken);
    }
  }
};
