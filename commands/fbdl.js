const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbdl',
  description: 'Download Facebook video from a given URL.',
  usage: 'fbdl <facebook_video_url>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const videoUrl = args[0];

    if (!videoUrl) {
      await sendMessage(senderId, { text: 'Please provide a Facebook video URL.' }, pageAccessToken);
      return;
    }

    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/fbdl?url=${encodeURIComponent(videoUrl)}`;

    try {
      const response = await axios.get(apiUrl, { responseType: 'json' });

      console.log('Response Type:', typeof response.data);
      console.log('API Response:', response.data);

      if (typeof response.data !== 'object') {
        throw new Error('Invalid API response format.');
      }

      const videoLink = response.data.video || response.data.url || response.data.result;

      if (videoLink) {
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: videoLink,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'No downloadable video found at the provided URL.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error in fbdl command:', error.response?.data || error.message || error);
      await sendMessage(senderId, { text: 'An error occurred while processing your request. Please try again later.' }, pageAccessToken);
    }
  }
};
