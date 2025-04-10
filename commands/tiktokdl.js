const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/.+$/;

async function resolveRedirect(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 0,
      validateStatus: status => status >= 300 && status < 400,
    });
    return response.headers.location || url;
  } catch (error) {
    if (error.response?.headers?.location) {
      return error.response.headers.location;
    }
    return url;
  }
}

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok videos without watermark',
  usage: 'tiktokdl <TikTok link>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const inputLink = args.join(' ');

    if (!inputLink || !tiktokRegex.test(inputLink)) {
      return sendMessage(senderId, {
        text: 'Please provide a valid TikTok video link.\nExample: tiktokdl https://vt.tiktok.com/ZSraRB1sq'
      }, pageAccessToken);
    }

    try {
      const finalLink = await resolveRedirect(inputLink);

      const response = await axios.get(`https://www.tikwm.com/api/`, {
        params: { url: finalLink }
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
