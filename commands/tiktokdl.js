const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'tiktokdl',
  description: 'Download a TikTok video without watermark.',
  usage: 'tiktokdl <TikTok video URL>\nExample: tiktokdl https://vt.tiktok.com/ZSrmMsSAD/',
  author: 'ishowmeat',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a TikTok video URL. Ex: tiktokdl https://vt.tiktok.com/ZSrmMsSAD/'
      }, pageAccessToken);
      return;
    }

    const videoUrlInput = args[0];
    const apiUrl = `${api.kaizen}/api/tiktok-dl?url=${encodeURIComponent(videoUrlInput)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data) {
        const { title, author, url: videoDownloadUrl } = response.data;

        await sendMessage(senderId, {
          text: `Title: ${title}\nAuthor: ${author}`
        }, pageAccessToken);

        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: videoDownloadUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in tiktokdl command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please check the URL and try again.'
      }, pageAccessToken);
    }
  }
};
