const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tiksearch',
  description: 'Search for TikTok videos using a keyword.',
  usage: 'tiksearch <keyword>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const keyword = args.join(' ');
    const isFbLite = keyword.includes(' | fblite');

    if (!keyword || (keyword && keyword.trim() === '')) {
      await sendMessage(senderId, {
        text: 'Please provide a keyword to search for.\n\nNote: If you\'re using Facebook Lite, try using the command like this: tiksearch cat | fblite'
      }, pageAccessToken);
      return;
    }

    try {
      await sendMessage(senderId, {
        text: `🔍 Searching for "${keyword.replace(' | fblite', '')}"...`
      }, pageAccessToken);

      const count = isFbLite ? 1 : 5;
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/tiksearchv2?search=${encodeURIComponent(keyword.replace(' | fblite', ''))}&count=${count}`;
      const response = await axios.get(apiUrl);

      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        if (isFbLite) {
          const videoUrl = response.data.data[0].video;
          await sendMessage(senderId, {
            text: `🔍 Search Results: ${keyword.replace(' | fblite', '')}\nWatch: ${videoUrl}`
          }, pageAccessToken);
          await sendMessage(senderId, {
            attachment: {
              type: 'video',
              payload: {
                url: videoUrl
              }
            }
          }, pageAccessToken);
        } else {
          const elements = response.data.data.map((video, index) => ({
            title: video.title || `Video ${index + 1}`,
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
                payload: `WATCH_VIDEO_PAYLOAD|${keyword.replace(' | fblite', '')}|${video.video}`
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

          try {
            await sendMessage(senderId, message, pageAccessToken);
            await sendMessage(senderId, {
              text: `Note: If you're using Facebook Lite and having issues, try using the command like this: tiksearch cat | fblite`
            }, pageAccessToken);
          } catch (error) {
            console.error('Error sending generic template:', error);
            const videoUrl = response.data.data[0].video;
            await sendMessage(senderId, {
              text: `🔍 Search Results: ${keyword.replace(' | fblite', '')}\nWatch: ${videoUrl}`
            }, pageAccessToken);
            await sendMessage(senderId, {
              attachment: {
                type: 'video',
                payload: {
                  url: videoUrl
                }
              }
            }, pageAccessToken);
          }
        }
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
