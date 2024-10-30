const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tiktokdl',
  description: 'Download a TikTok video using a video URL.',
  usage: 'tiktokdl <TikTok video URL>\nExample: tiktokdl https://vt.tiktok.com/ZSjFnGp42/',
  author: 'Churchill',
  async execute(senderId, args, pageAccessToken) {
    const urlPattern = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;

    if (!args || args.length === 0 || !urlPattern.test(args[0])) {
      await sendMessage(senderId, {
        text: 'Please provide a valid TikTok video URL.\n\nUsage:\n tiktokdl <TikTok video URL>\nExample: tiktokdl https://vt.tiktok.com/ZSjFnGp42/'
      }, pageAccessToken);
      return;
    }

    const videoUrl = args[0];
    const apiUrl = `https://kaiz-media-dl-api.vercel.app/tiktok?url=${encodeURIComponent(videoUrl)}`;

    await sendMessage(senderId, { text: 'Downloading TikTok video... Please wait.' }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const downloadUrl = response.data.url;

      if (downloadUrl) {
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: downloadUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Unable to download the video. Please check the URL and try again.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error downloading TikTok video:', error);
      await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
    }
  }
};
