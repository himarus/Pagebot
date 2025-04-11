const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'tiktokdl',
  description: 'Download a TikTok video without watermark at send thumbnail for extra flair.',
  usage: 'tiktokdl <TikTok video URL>\nExample: tiktokdl https://vt.tiktok.com/ZSrmMsSAD/',
  author: 'chill',

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
        const { title, author, thumbnail, url: videoDownloadUrl } = response.data;

        // Send video title and author
        await sendMessage(senderId, {
          text: `Title: ${title}\nAuthor: ${author}`
        }, pageAccessToken);

        // Send thumbnail image
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: thumbnail,
              is_reusable: true
            }
          }
        }, pageAccessToken);

        // Send video attachment
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
      console.error('Error in tiktokdl command:', error.response ? error.response.data : error.message);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please check the URL and try again.'
      }, pageAccessToken);
    }
  }
};
