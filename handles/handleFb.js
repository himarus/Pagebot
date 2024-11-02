const axios = require('axios');
const { sendMessage } = require('./sendMessage');

async function handleFb(chilli, kupal) {
  const pogi = chilli.sender.id;
  const messageText = chilli.message.text;

  // Check if the message contains a Facebook Reels link
  const regEx_facebookReels = /https:\/\/www\.facebook\.com\/reel\//;
  if (regEx_facebookReels.test(messageText)) {
    // Notify the user that the download is in progress
    await sendMessage(pogi, { text: 'Downloading your Facebook Reel, please wait...' }, kupal);

    try {
      // Make a request to the Facebook Reels downloader API
      const response = await axios.get(`https://joshweb.click/api/fbdl2?url=${encodeURIComponent(messageText)}`);
      const data = response.data.result;
      const videoUrl = data.HD || data.normal_video;

      // Check if there's an available video URL
      if (videoUrl) {
        // Send the video as an attachment
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
        await sendMessage(pogi, { text: 'Unable to find a video in the provided Facebook Reel link.' }, kupal);
      }
    } catch (chilliError) {
      console.error('Error downloading Facebook Reel video:', chilliError);
      await sendMessage(pogi, { text: 'An error occurred while downloading the Facebook Reel video. Please try again later.' }, kupal);
    }
    return true;
  }
  return false;
}

module.exports = { handleFb };
