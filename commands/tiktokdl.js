const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok video using a link',
  usage: 'tiktokdl <tiktok link>',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const link = args[0];
    if (!link || !link.includes("tiktok.com")) {
      return sendMessage(senderId, {
        text: 'Please provide a valid TikTok link.\nExample: tiktokdl https://www.tiktok.com/@user/video/123456789'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '⏳ Downloading TikTok video, please wait...'
    }, pageAccessToken);

    try {
      const res = await axios.post("https://www.tikwm.com/api/", { url: link }, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/json',
        }
      });

      const data = res.data?.data;
      if (!data || !data.play) {
        return sendMessage(senderId, {
          text: '⚠️ Failed to retrieve video. The TikTok link may be invalid or private.'
        }, pageAccessToken);
      }

      const video = await axios.get(data.play, { responseType: 'stream' });

      await sendMessage(senderId, {
        text: `✅ Download complete!\n\nTitle: ${data.title || 'Untitled'}\nLikes: ${data.digg_count} | Comments: ${data.comment_count}`,
        attachment: {
          type: 'video',
          payload: {
            is_reusable: true,
            filedata: video.data
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('TikTokDL Error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error: Failed to download TikTok video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
