const axios = require('axios');
const { sendMessage, sendButton } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ytsearch',
  description: 'Search for a YouTube video and download it as an MP4.',
  usage: 'ytsearch <keyword>\nExample: ytsearch apt',
  author: 'chilli',
  async execute(kupal, pogi, pageAccessToken) {
    if (!pogi || pogi.length === 0) {
      await sendMessage(kupal, {
        text: '❗ Please provide a keyword to search for a video.\n\nExample: ytsearch apt'
      }, pageAccessToken);
      return;
    }

    const keyword = pogi.join(' ');
    const searchApiUrl = `${api.nethApi}/api/ytsearch2?name=${encodeURIComponent(keyword)}`;

    await sendMessage(kupal, {
      text: `🔍 Searching YouTube for "${keyword}"... Please wait.`
    }, pageAccessToken);

    try {
      const searchResponse = await axios.get(searchApiUrl);
      const firstResult = searchResponse.data.result[0];

      if (!firstResult) {
        await sendMessage(kupal, {
          text: `🚫 No videos found for "${keyword}". Please try another keyword.`
        }, pageAccessToken);
        return;
      }

      const { url, title, views, duration, imgSrc } = firstResult;
      const conversionApiUrl = `${api.kenlie}/video?url=${encodeURIComponent(url)}`;

      const videoDetailsMessage = `📹 **Video Found**:\n\n📌 **Title**: ${title}\n⏰ **Duration**: ${duration}\n👁️ **Views**: ${views}\n\n𝘛𝘩𝘦 𝘷𝘪𝘥𝘦𝘰 𝘪𝘴 𝘴𝘦𝘯𝘥𝘪𝘯𝘨 𝘱𝘭𝘴𝘴 𝘸𝘢𝘪𝘵 𝘢 𝘮𝘰𝘮𝘦𝘯𝘵....`;

      await sendButton(videoDetailsMessage, [
        {
          type: 'web_url',
          url: url,
          title: '📺 Watch on YouTube'
        },
        {
          type: 'web_url',
          url: conversionApiUrl,
          title: '⬇️ Download MP4'
        }
      ], kupal, pageAccessToken);

      const conversionResponse = await axios.get(conversionApiUrl);
      const { response: mp4Url } = conversionResponse.data;

      if (!mp4Url) {
        await sendMessage(kupal, {
          text: `🚧 Unable to convert the video. Please try again later.`
        }, pageAccessToken);
        return;
      }

      const headResponse = await axios.head(mp4Url);
      const videoSize = parseInt(headResponse.headers['content-length'], 10);
      const limitInBytes = 25 * 1024 * 1024;

      if (videoSize <= limitInBytes) {
        await sendMessage(kupal, {
          attachment: {
            type: 'video',
            payload: {
              url: mp4Url
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(kupal, {
          text: `⚠️ The video exceeds 25MB and cannot be sent directly. You can download it using the link below:\n\n🔗 ${mp4Url}`
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error in ytsearch command:', error.message);
      await sendMessage(kupal, {
        text: '🚧 An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
