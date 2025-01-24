const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const api = require('../handles/api');

async function handleFacebookReelsVideo(chilli, kupal) {
  const pogi = chilli.sender.id;
  const messageText = chilli.message.text;

  const regEx_fbReels = /https:\/\/www\.facebook\.com\/(reel\/\d+\?|share\/r\/[a-zA-Z0-9]+\/\?)/;
  if (regEx_fbReels.test(messageText)) {
    await sendMessage(pogi, { text: 'Downloading your Facebook Reel, please wait...' }, kupal);
    try {
      const apiUrl = `${api.kaizen}/api/fbdl?url=${encodeURIComponent(messageText)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.videoUrl) {
        const videoUrl = data.videoUrl;

        // Check video size
        const videoHead = await axios.head(videoUrl);
        const videoSize = parseInt(videoHead.headers['content-length'], 10);

        if (videoSize && videoSize <= 25 * 1024 * 1024) { // 25 MB limit
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
          await sendMessage(pogi, { text: 'The video is too large to download (limit is 25 MB). Please try another video.' }, kupal);
        }
      } else {
        await sendMessage(pogi, { text: 'Failed to retrieve the video. Please make sure the link is correct.' }, kupal);
      }
    } catch (chilliError) {
      console.error('Error downloading Facebook Reel:', chilliError);
      await sendMessage(pogi, { text: 'An error occurred while downloading the Facebook Reel. Please try again later.' }, kupal);
    }
    return true;
  }
  return false;
}

module.exports = { handleFacebookReelsVideo };
