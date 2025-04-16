const yts = require('yt-search');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

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
      text: `[⏳] Searching for "${query}"...\n\nThis may take about 1 minute and 30 seconds. Please wait.`
    }, pageAccessToken);

    try {
      const searchResult = await yts(query);
      const video = searchResult.videos[0];

      if (!video) {
        return sendMessage(senderId, { text: 'No results found.' }, pageAccessToken);
      }

      const apiUrl = `https://nodejs-version-ytdlcc-production.up.railway.app/ytdl?url=${video.url}&type=mp3`;
      const { data } = await axios.get(apiUrl);

      const forceDownloadUrl = `${data.download}?dl=1`;

      await sendMessage(senderId, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: data.title || video.title,
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
                    url: forceDownloadUrl,
                    title: 'Download MP3'
                  }
                ]
              }
            ]
          }
        }
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: data.download
          }
        }
      }, pageAccessToken);

    } catch (err) {
      console.error('Error in music command:', err.message || err);
      await sendMessage(senderId, {
        text: `⚠️ Error while searching or fetching MP3: ${err.response ? err.response.data : err.message || err}`
      }, pageAccessToken);
    }
  }
};
