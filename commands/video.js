const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'video',
  description: 'Search and download a video based on a keyword.',
  usage: 'video <keyword>\nExample: video apt',
  author: 'chilli',
  async execute(kupal, pogi, pageAccessToken) {
    if (!pogi || pogi.length === 0) {
      await sendMessage(kupal, {
        text: 'Please provide a keyword to search for a video.\n\nUsage:\n video <keyword>\nExample: video apt'
      }, pageAccessToken);
      return;
    }

    const chilli = pogi.join(' ');
    const apiUrl = `https://betadash-search-download.vercel.app/videov2?search=${encodeURIComponent(chilli)}`;

    await sendMessage(kupal, { text: `Searching for video: "${chilli}"... Please wait.` }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const videoData = response.data;

      if (!videoData || !videoData.downloadUrl) {
        await sendMessage(kupal, {
          text: `No video found for the keyword "${chilli}". Please try another keyword.`
        }, pageAccessToken);
        return;
      }

      await sendMessage(kupal, {
        text: `**Video Found!**\n\nTitle: ${videoData.title}\nChannel: ${videoData.channelName}\nViews: ${videoData.views}\nDuration: ${videoData.time}`
      }, pageAccessToken);

      await sendMessage(kupal, {
        attachment: {
          type: 'video',
          payload: {
            url: videoData.downloadUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error fetching video:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while fetching the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
