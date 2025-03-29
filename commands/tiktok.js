const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tiksearch',
  description: 'Search for TikTok videos using a keyword.',
  usage: 'tiksearch <keyword>',
  author: 'Your Name',

  async execute(senderId, args, pageAccessToken) {
    const keyword = args.join(' ');

    if (!keyword) {
      await sendMessage(senderId, {
        text: 'Please provide a keyword to search for.'
      }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/tiksearchv2?search=${encodeURIComponent(keyword)}&count=5`;
      const response = await axios.get(apiUrl);

      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const elements = response.data.data.map(video => ({
          title: video.title || 'No Title',
          image_url: video.cover,
          default_action: {
            type: 'web_url',
            url: video.video,
            webview_height_ratio: 'compact'
          },
          buttons: [
            {
              type: 'postback',
              title: 'Watch Video',
              payload: `WATCH_VIDEO_PAYLOAD|${video.video}`
            }
          ]
        }));

        const message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements
            }
          }
        };

        await sendMessage(senderId, message, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'No results found for your search query.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error searching TikTok videos:', error.message || error);
      await sendMessage(senderId, {
        text: 'Failed to search for TikTok videos. Please try again.'
      }, pageAccessToken);
    }
  }
};
