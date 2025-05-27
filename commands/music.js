const yts = require('yt-search');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'music',
  description: 'Search and play music from YouTube with mp3 audio and preview.',
  usage: 'music <title>',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, {
        text: 'Please enter a music title.\nUsage: music <title>'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: `[⏳] Searching for "${query}"...\n\nThis may take about 1 minute. Please wait.`
    }, pageAccessToken);

    try {
      const searchResult = await yts(query);
      const video = searchResult.videos[0];

      if (!video) {
        return sendMessage(senderId, { text: 'No results found.' }, pageAccessToken);
      }

      const apiUrl = `${api.kaizen.base}/api/ytdown-mp3?url=${encodeURIComponent(video.url)}&apikey=${api.kaizen.key}`;
      const { data } = await axios.get(apiUrl);

      const { title, download_url } = data;

      await sendMessage(senderId, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: title || video.title,
                image_url: video.thumbnail,
                subtitle: `Artist: ${video.author.name}\nDuration: ${video.timestamp}`,
                default_action: {
                  type: 'web_url',
                  url: video.url,
                  webview_height_ratio: 'compact'
                },
                buttons: [
                  {
                    type: 'web_url',
                    url: video.url,
                    title: 'Watch on YouTube'
                  },
                  {
                    type: 'web_url',
                    url: `${download_url}?dl=1`,
                    title: 'Download MP3'
                  }
                ]
              }
            ]
          }
        }
      }, pageAccessToken);

      try {
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: download_url
            }
          }
        }, pageAccessToken);
      } catch (err) {
        // Fallback to video-style if audio upload fails
        await sendMessage(senderId, {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'media',
              elements: [
                {
                  media_type: 'video',
                  url: download_url
                }
              ]
            }
          }
        }, pageAccessToken);
      }

    } catch (err) {
      console.error('Error in music command:', err.message || err);
      await sendMessage(senderId, {
        text: `⚠️ Error while searching or fetching MP3: ${err.response ? err.response.data : err.message || err}`
      }, pageAccessToken);
    }
  }
};
