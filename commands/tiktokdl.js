const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok videos without watermark.',
  usage: 'tiktokdl <TikTok Video URL>',
  author: 'chillibot',

  async execute(senderId, args, pageAccessToken) {
    const videoUrl = args[0];
    const tiktokUrlPattern = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/;

    if (!videoUrl || !tiktokUrlPattern.test(videoUrl)) {
      await sendMessage(senderId, {
        text: '❌ Invalid TikTok video URL.\n\nUsage: tiktokdl <TikTok Video URL>'
      }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, {
      text: '[⏳] Downloading TikTok video, please wait...'
    }, pageAccessToken);

    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data?.data;

      if (data && data.play) {
        await sendMessage(senderId, {
          text: `✅ Video found!\n\n📌 Title: ${data.title || 'N/A'}\n👤 Author: ${data.author?.nickname || 'Unknown'}`
        }, pageAccessToken);

        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: data.play,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Failed to retrieve the video. Please make sure the link is correct.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error in tiktokdl command:', error.message || error);
      await sendMessage(senderId, {
        text: '❌ An error occurred while downloading the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
