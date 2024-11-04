const axios = require('axios');
const { sendMessage } = require('./sendMessage');

async function handleInstagramVideo(chilli, kupal) {
  const pogi = chilli.sender.id;
  const messageText = chilli.message.text;
  const regEx_instagram = /https:\/\/www\.instagram\.com\/reel\/\w+/;
  
  if (regEx_instagram.test(messageText)) {
    await sendMessage(pogi, { text: 'Downloading your Instagram video, please wait...' }, kupal);
    
    try {
      const response = await axios.get(`https://jerome-web.gleeze.com/service/api/alldl?url=${encodeURIComponent(messageText)}`);
      const data = response.data;

      if (data.status) {
        const videoUrl = data.data.high;
        const videoSize = await getVideoSize(videoUrl);
        
        if (videoSize && videoSize <= 25 * 1024 * 1024) {
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
          await sendMessage(pogi, { text: 'The video is too large to download (limit is 25 MB). Please try a shorter video.' }, kupal);
        }
      } else {
        await sendMessage(pogi, { text: 'Failed to fetch the video. Please check the link and try again.' }, kupal);
      }
    } catch (error) {
      console.error('Error downloading Instagram video:', error);
      await sendMessage(pogi, { text: 'An error occurred while downloading the Instagram video. Please try again later.' }, kupal);
    }
    return true;
  }
  return false;
}

async function getVideoSize(url) {
  const head = await axios.head(url);
  return parseInt(head.headers['content-length'], 10);
}

module.exports = { handleInstagramVideo };
