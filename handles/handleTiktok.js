const axios = require('axios');
const { sendMessage } = require('./sendMessage');

async function handleTikTokVideo(chilli, kupal) {
  const pogi = chilli.sender.id;
  const messageText = chilli.message.text;

  const regEx_tiktok = /https:\/\/(www\.|vt\.)?tiktok\.com\//;
  if (regEx_tiktok.test(messageText)) {
    await sendMessage(pogi, { text: 'Downloading your TikTok video, please wait...' }, kupal);
    try {
      const response = await axios.post(`https://www.tikwm.com/api/`, { url: messageText });
      const data = response.data.data;
      const videoUrl = data.play;
      const videoSize = data.size;

      if (videoSize && videoSize <= 40 * 1024 * 1024) {
        await sendMessage(pogi, {
          attachment: {
            type: 'video',
            payload: {
              url: videoUrl,
              is_reusable: true
            }
          }
        }, kupal);
      } else {
        await sendMessage(pogi, { text: 'The video is too large to send (limit is 40 MB). Try a shorter or lower-quality video.' }, kupal);
      }
    } catch (chilliError) {
      console.error('Error downloading TikTok video:', chilliError);
      await sendMessage(pogi, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, kupal);
    }
    return true;
  }
  return false;
}

module.exports = { handleTikTokVideo };
