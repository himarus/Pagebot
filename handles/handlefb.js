const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const regEx_fb = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com)\/[^\s]+$/m;

async function handleFacebookVideo(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  if (regEx_fb.test(messageText)) {
    await sendMessage(senderId, {
      text: 'Downloading your Facebook video, please wait...'
    }, pageAccessToken);

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl?url=${encodeURIComponent(messageText)}`;
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.videoUrl;

      if (!videoUrl) {
        const errorMsg = response.data.message || 'No download URL found';
        await sendMessage(senderId, {
          text: `Failed to retrieve the video URL.\nReason: ${errorMsg}`
        }, pageAccessToken);
        return true;
      }

      const head = await axios.head(videoUrl);
      const contentLength = head.headers['content-length'];

      if (contentLength && parseInt(contentLength) > 40 * 1024 * 1024) {
        await sendMessage(senderId, {
          text: `The video is larger than 40MB. You can download it directly here:\n${videoUrl}`
        }, pageAccessToken);
        return true;
      }

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
      console.error('FB Video Download Error:', error.message);
      await sendMessage(senderId, {
        text: 'An error occurred while downloading the Facebook video. Please try again later.'
      }, pageAccessToken);
    }

    return true;
  }

  return false;
}

module.exports = { handleFacebookVideo };
