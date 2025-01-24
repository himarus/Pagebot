const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const api = require('../handles/api');

const MAX_VIDEO_SIZE_MB = 25;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

async function handleFacebookReelsVideo(chilli, kupal) {
  const pogi = chilli.sender.id;
  const messageText = chilli.message.text;

  // Regular expression to match all valid Facebook Reel links
  const regEx_facebookReels = /https:\/\/www\.facebook\.com\/(reel|share\/r)\/\S+/;
  if (regEx_facebookReels.test(messageText)) {
    await sendMessage(pogi, { text: '📥 | Downloading your Facebook Reel, please wait...' }, kupal);

    try {
      const response = await axios.get(`${api.joshWebApi}/api/reels?url=${encodeURIComponent(messageText)}`);
      const data = response.data.result;

      if (data.success && data.links) {
        const videoUrl = data.links.high || data.links.low;

        if (videoUrl) {
          const headResponse = await axios.head(videoUrl);
          const videoSize = parseInt(headResponse.headers['content-length'], 10);

          if (videoSize && videoSize <= MAX_VIDEO_SIZE_BYTES) {
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
            await sendMessage(pogi, {
              text: `⚠️ | The video exceeds the ${MAX_VIDEO_SIZE_MB} MB limit. Please provide a link to a shorter video.`
            }, kupal);
          }
        } else {
          await sendMessage(pogi, { text: '❌ | Unable to find a video in the provided Facebook Reel link.' }, kupal);
        }
      } else {
        await sendMessage(pogi, { text: '❌ | Failed to fetch the video. Please check the link or try again later.' }, kupal);
      }
    } catch (chilliError) {
      console.error('Error downloading Facebook Reel video:', chilliError);
      await sendMessage(pogi, { text: '❌ | An error occurred while downloading the Facebook Reel video. Please try again later.' }, kupal);
    }
    return true;
  }
  return false;
}

module.exports = { handleFacebookReelsVideo };
