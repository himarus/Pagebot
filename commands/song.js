const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'song',
  description: 'Search for a song using the Yakzy API',
  usage: 'song <title>',
  author: 'Churchill',

  async execute(senderId, args, pageAccessToken) {
    const searchQuery = args.join(' ');

    if (!searchQuery || searchQuery.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a song title. Example: song Apt'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.yakzy}/sc?search=${encodeURIComponent(searchQuery)}`;

    try {
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error('No results found.');
      }

      const { title, stream_url, thumbnail, source_url } = response.data.data[0];

      await sendMessage(senderId, {
        text: `🎵 **Now Playing:** ${title}\n🔗 [Listen Here](${source_url})`
      }, pageAccessToken);

      if (thumbnail) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: thumbnail,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      }

      if (stream_url) {
        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: stream_url
            }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error in song command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while searching for the song. Please try again later.'
      }, pageAccessToken);
    }
  }
};
