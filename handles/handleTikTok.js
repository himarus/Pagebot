const axios = require('axios');
const { sendMessage } = require('./sendMessage');

async function handleTikTokVideo(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  const regEx_tiktok = /https:\/\/(www\.|vt\.)?tiktok\.com\//;
  if (regEx_tiktok.test(messageText)) {
    await sendMessage(senderId, { text: 'Downloading your TikTok video, please wait...' }, pageAccessToken);
    try {
      const response = await axios.post(`https://www.tikwm.com/api/`, { url: messageText });
      const data = response.data.data;
      const videoUrl = data.play;

      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: videoUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error downloading TikTok video:', error);
      await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
    }
    return true; // Indicates that a TikTok video was handled
  }
  return false; // Indicates that the message is not a TikTok link
}

module.exports = { handleTikTokVideo };
