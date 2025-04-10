const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/.+$/;

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok videos without watermark',
  usage: 'tiktokdl <TikTok link>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const link = args.join(' ');

    if (!link || !tiktokRegex.test(link)) {
      return sendMessage(senderId, {
        text: 'Please provide a valid TikTok video link.\nExample: tiktokdl https://www.tiktok.com/@xxx/video/xxxxxxxxxxxxxxx'
      }, pageAccessToken);
    }

    try {
      const response = await axios.get(`https://www.tikwm.com/api/`, {
        params: { url: link }
      });

      const result = response.data?.data;

      if (!result || !result.play) {
        throw new Error('Invalid video data');
      }

      await sendMessage(senderId, {
        text: `✅ Video Found: ${result.title || 'Untitled'}\n\nDownloading...`
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: result.play
          }
        }
      }, pageAccessToken);
    } catch (err) {
      console.error('TikTokDL Error:', err.message || err);
      await sendMessage(senderId, {
        text: '⚠️ Failed to download the video. Please make sure the link is correct or try again later.'
      }, pageAccessToken);
    }
  }
};
