const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const regEx_tiktok = /https:\/\/(www\.|vt\.)?tiktok\.com\//;

module.exports = {
  name: 'tikdl',
  description: 'Download a TikTok video using a URL.',
  usage: 'tikdl <TikTok video URL>\nExample: tikdl https://vt.tiktok.com/ZSj2TL73Y',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0 || !regEx_tiktok.test(args[0])) {
      await sendMessage(senderId, {
        text: 'Please provide a valid TikTok video URL.\n\nUsage:\n tikdl <TikTok video URL>\nExample: tikdl https://vt.tiktok.com/ZSj2TL73Y'
      }, pageAccessToken);
      return;
    }

    const videoUrl = args[0];
    const apiUrl = `${api.joshWebApi}/tiktokdl?url=${encodeURIComponent(videoUrl)}`;

    await sendMessage(senderId, { text: 'Downloading TikTok video... Please wait.' }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const { url } = response.data;

      // Send only the video attachment, without additional fields
      if (url) {
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: url
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'Failed to retrieve the video. The URL may be invalid or unsupported.'
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error downloading TikTok video:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while downloading the TikTok video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
