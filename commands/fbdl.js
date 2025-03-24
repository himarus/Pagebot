const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbdl',
  description: 'Download Facebook video from a given URL.',
  usage: 'fbdl <facebook_video_url>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const videoUrl = args[0];

    // Validate the provided Facebook video URL
    const isValidFacebookVideoUrl = (url) => {
      const regex = /^(https?:\/\/)?(www\.)?(facebook\.com\/.*\/videos\/\d+|facebook\.com\/.*\/posts\/\d+|facebook\.com\/share\/r\/\w+|facebook\.com\/.*\/videos\/)/;
      return regex.test(url);
    };

    if (!videoUrl || !isValidFacebookVideoUrl(videoUrl)) {
      await sendMessage(senderId, { text: '⚠️ Please provide a valid Facebook video URL.' }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, { text: `🔍 Fetching video from: ${videoUrl}` }, pageAccessToken);

    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/fbdl?url=${encodeURIComponent(videoUrl)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.result) {
        const videoLink = response.data.result;

        // Check if the video link is accessible
        const checkVideo = await axios.head(videoLink);
        const type = checkVideo.headers['content-type'] || '';

        if (type.includes('video')) {
          await sendMessage(senderId, {
            attachment: {
              type: 'video',
              payload: {
                url: videoLink
              }
            }
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: '⚠️ No downloadable video found at the provided URL.' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: '⚠️ No downloadable video found at the provided URL.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error in fbdl command:', error.response ? error.response.data : error.message || error);
      await sendMessage(senderId, { text: '⚠️ An error occurred while processing your request. Please try again later.' }, pageAccessToken);
    }
  }
};
