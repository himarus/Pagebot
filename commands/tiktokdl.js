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
      const response = await axios.get(apiUrl);

      if (response.data?.status === 'success' && response.data.downloadUrls?.length > 0) {
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: response.data.downloadUrls[0],
              is_reusable: true
            }
          }
        }, pageAccessToken);

        await sendMessage(senderId, {
          text: `✅ Download Successful\n\nTitle: ${response.data.title || 'Untitled'}`
        }, pageAccessToken);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      await sendMessage(senderId, {
        text: '⚠️ Failed to download TikTok video. Please check the URL or try again later.'
      }, pageAccessToken);
    }
  }
};
