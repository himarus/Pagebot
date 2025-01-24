const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'lyrics',
  description: 'Fetch lyrics of a song using Kaizen API.',
  usage: 'lyrics <song title>\nExample: lyrics apt',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    const songTitle = args.join(' ');

    if (!songTitle || songTitle.trim() === '') {
      await sendMessage(senderId, {
        text: 'Please provide a song title.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/lyrics?title=${encodeURIComponent(songTitle)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.lyrics && response.data.thumbnail) {
        const { title, thumbnail, lyrics } = response.data;

        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: thumbnail,
              is_reusable: true
            }
          }
        }, pageAccessToken);

        await sendMessage(senderId, {
          text: `🎶 *${title}*\n\n📝 *Lyrics:*\n\n${lyrics}`
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Unable to fetch the lyrics. Please check the song title and try again.'
        }, pageAccessToken);
      }
    } catch (error) {
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while fetching the lyrics. Please try again later.`
      }, pageAccessToken);
    }
  }
};
