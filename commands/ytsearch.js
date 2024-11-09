const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ytsearch',
  description: 'Search and send a YouTube video based on a keyword.',
  usage: 'ytsearch <keyword>\nExample: ytsearch apt',
  author: 'chilli',
  async execute(kupal, pogi, pageAccessToken) {
    if (!pogi || pogi.length === 0) {
      await sendMessage(kupal, {
        text: 'Please provide a title for the search.\n\nExample: ytsearch apt'
      }, pageAccessToken);
      return;
    }

    const chilli = pogi.join(' ');
    const apiUrl = `${api.kenlie}/ytsearch?title=${encodeURIComponent(chilli)}`;

    await sendMessage(kupal, { text: `🔍 Searching for YouTube video: "${chilli}"... Please wait.` }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const videos = response.data.videos;

      if (!videos || videos.length === 0) {
        await sendMessage(kupal, {
          text: `No video found for the title "${chilli}". Please try another title.`
        }, pageAccessToken);
        return;
      }

      const firstVideo = videos[0];
      const { title, url, thumbnail, views, duration } = firstVideo;

      await sendMessage(kupal, {
        text: `🎬 **${title}**\n📺 **Views**: ${views}\n⏰ **Duration**: ${duration}\n📲 [Watch on YouTube](${url})`,
      }, pageAccessToken);

      const videoResponse = await axios.head(url);
      const fileSize = parseInt(videoResponse.headers['content-length'], 10);

      if (fileSize <= 25 * 1024 * 1024) {
        await sendMessage(kupal, {
          attachment: {
            type: 'video',
            payload: {
              url: url
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(kupal, {
          text: `⚠️ The video exceeds the 25 MB limit. Please click "Watch Video" below to view it on YouTube.`,
        }, pageAccessToken);

        await sendMessage(kupal, {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [
                {
                  title: title,
                  image_url: thumbnail,
                  subtitle: `${views} views | ${duration}`,
                  buttons: [
                    {
                      type: 'web_url',
                      url: url,
                      title: 'Watch Video'
                    }
                  ]
                }
              ]
            }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      await sendMessage(kupal, {
        text: 'An error occurred while searching for the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
