const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const api = require('../handles/api');

async function handleFacebookReelsVideo(chilli, kupal) {
  const pogi = chilli.sender.id;
  const messageText = chilli.message.text;

  
  const regEx_facebookReels = /https:\/\/www\.facebook\.com\/reel\//;
  if (regEx_facebookReels.test(messageText)) {
    
    await sendMessage(pogi, { text: 'Downloading your Facebook Reel, please wait...' }, kupal);

    try {
      
      const response = await axios.get(`${api.joshWebApi}/api/fbdl2?url=${encodeURIComponent(messageText)}`);
      const data = response.data.result;
      const videoUrl = data.HD || data.normal_video;


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

module.exports = { handleFacebookReelsVideo };
