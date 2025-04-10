const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok video using Yakzy API',
  usage: 'tiktokdl <tiktok_url>',
  author: 'chil',

  async execute(senderId, args, pageAccessToken) {
    const tiktokUrl = args[0];

    if (!tiktokUrl) {
      await sendMessage(senderId, {
        text: '⚠️ Please provide a TikTok URL. Example: tiktokdl https://vt.tiktok.com/ZSraRB1sq/'
      }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `${api.yakzy}/api/tiktok?link=${encodeURIComponent(tiktokUrl)}`;
      
      // Axios configuration with timeout and redirect handling
      const axiosConfig = {
        timeout: 10000, // 10 seconds timeout
        maxRedirects: 5,  // Follow up to 5 redirects
        headers: {
          'Content-Type': 'application/json' // Adjust header if needed
        }
      };

      const response = await axios.get(apiUrl, axiosConfig);

      if (response.data?.status === 'success' && response.data.downloadUrls?.length > 0) {
        const videoUrl = response.data.downloadUrls[0];
        const videoTitle = response.data.title || 'Untitled';

        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: videoUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);

        await sendMessage(senderId, {
          text: `✅ Download Successful\n\nTitle: ${videoTitle}`
        }, pageAccessToken);
      } else {
        console.error('API Response:', response.data); // Log the API response
        await sendMessage(senderId, {
          text: '⚠️ Failed to process the TikTok video. The API returned an unexpected response.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error.message || error);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
        console.error('Response Headers:', error.response.headers);
      }
      await sendMessage(senderId, {
        text: '⚠️ Failed to download TikTok video. Please check the URL or try again later.'
      }, pageAccessToken);
    }
  }
};
