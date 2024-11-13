const axios = require('axios');
const { sendMessage, sendButton } = require('../handles/sendMessage');

module.exports = {
  name: 'video',
  description: 'Search and download a video based on a keyword.',
  usage: 'video <keyword>\nExample: video apt',
  author: 'chilli',
  async execute(kupal, pogi, pageAccessToken) {
    if (!pogi || pogi.length === 0) {
      await sendMessage(kupal, {
        text: '❗ Please provide a keyword to search for a video.\n\nExample: video apt'
      }, pageAccessToken);
      return;
    }

    const chilli = pogi.join(' ');
    const apiUrl = `https://betadash-search-download.vercel.app/videov2?search=${encodeURIComponent(chilli)}`;

    await sendMessage(kupal, { text: `🔍 Searching for video: "${chilli}"... Please wait.` }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const { title, downloadUrl, time, views, channelName } = response.data;

      if (!downloadUrl) {
        await sendMessage(kupal, {
          text: `🚫 No video found for the keyword "${chilli}". Please try another keyword.`
        }, pageAccessToken);
        return;
      }

      const videoDetails = `🎉 **Video Found!**\n\n📌 **Title**: ${title}\n📺 **Channel**: ${channelName}\n👁️ **Views**: ${views}\n⏰ **Duration**: ${time}`;

      // Use sendButton to send video details with a download button
      await sendButton(videoDetails, [
        {
          type: 'web_url',
          url: downloadUrl,
          title: '⬇️ Download Video'
        }
      ], kupal, pageAccessToken);

      const videoResponse = await axios.head(downloadUrl);
      const fileSize = parseInt(videoResponse.headers['content-length'], 10);

      if (fileSize <= 25 * 1024 * 1024) {
        await sendMessage(kupal, {
          attachment: {
            type: 'video',
            payload: {
              url: downloadUrl
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(kupal, {
          text: `⚠️ The video is too large to send directly (size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB).\n\nYou can download it here:\n${downloadUrl}`
        }, pageAccessToken);
      }

    } catch (error) {
      await sendMessage(kupal, {
        text: '🚧 An error occurred due to many user. Please try again later.'
      }, pageAccessToken);
    }
  }
};
