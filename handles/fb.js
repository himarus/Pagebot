const axios = require('axios');
const { sendMessage } = require('./sendMessage');

async function handleFacebookVideo(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  const regEx_fb = /https:\/\/(www\.)?(facebook\.com|fb\.watch)\//;
  if (regEx_fb.test(messageText)) {
    await sendMessage(senderId, { text: 'Downloading your Facebook video, please wait...' }, pageAccessToken);
    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl-v2?url=${encodeURIComponent(messageText)}`;
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.download_url;

      if (videoUrl) {
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: videoUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Failed to get the video URL. Please check the link and try again.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error downloading Facebook video:', error);
      await sendMessage(senderId, { text: 'An error occurred while downloading the Facebook video. Please try again later.' }, pageAccessToken);
    }
    return true;
  }

  return false;
}

module.exports = { handleFacebookVideo };
