const axios = require('axios');
const { sendMessage } = require('./sendMessage');

async function handleFacebookVideo(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  // Updated Regex 🔥
  const regEx_fb = /https:\/\/(www\.|m\.)?(facebook\.com\/(?:groups\/\d+\/permalink\/\d+|watch\/?\?v=\d+|[\w\-]+\/(videos|posts)\/\d+|story\.php\?story_fbid=\d+&id=\d+|reel\/\w+|share\/v\/\w+)|fb\.watch\/\w+)/i;

  if (regEx_fb.test(messageText)) {
    await sendMessage(senderId, { text: 'Downloading your Facebook video, please wait...' }, pageAccessToken);

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl-v2?url=${encodeURIComponent(messageText)}`;
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.download_url;

      if (!videoUrl) {
        await sendMessage(senderId, { text: 'Failed to retrieve the video URL. Please check the link and try again.' }, pageAccessToken);
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
