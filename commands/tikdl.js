const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tikdl',
  description: 'Download a TikTok video based on a link.',
  usage: 'tikdl <url>\nExample: tiktok https://www.tiktok.com/@username/video/1234567890',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a TikTok video URL.\n\nUsage:\n tikdl <url>\nExample: tikdl https://www.tiktok.com/@username/video/1234567890'
      }, pageAccessToken);
      return;
    }

    const tiktokUrl = args.join(' ');
    const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;

    if (tiktokRegex.test(tiktokUrl)) {
      await sendMessage(senderId, { text: 'Downloading your TikTok video, please wait...' }, pageAccessToken);
      try {
        const response = await axios.post(
          `https://www.tikwm.com/api/`,
          { url: tiktokUrl },
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36'
            }
          }
        );
        const data = response.data.data;
        const shotiUrl = data.play;

        if (shotiUrl) {
          await sendMessage(senderId, {
            attachment: {
              type: 'video',
              payload: {
                url: shotiUrl,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: 'Failed to retrieve TikTok video URL. Please check the URL and try again.' }, pageAccessToken);
        }
      } catch (error) {
        console.error("Error fetching TikTok video:", error);
        await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
      }
    } else {
      await sendMessage(senderId, { text: 'The provided link is not a valid TikTok URL. Please check and try again.' }, pageAccessToken);
    }
  }
};
