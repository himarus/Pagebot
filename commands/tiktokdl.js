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
      const { data } = await axios.post(
        'https://tikwm.com/api/',
        `url=${encodeURIComponent(link)}&count=12&cursor=0&web=1&hd=1`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { title, hdplay } = data.data;

      if (!hdplay) throw new Error('No downloadable video found');

      await sendMessage(senderId, {
        text: `✅ Video Found: ${title || 'Untitled'}\n\nDownloading...`
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: hdplay
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
