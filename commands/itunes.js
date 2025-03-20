const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'itunes',
  description: 'Search for music on iTunes and send a song preview.',
  usage: 'itunes <song/artist>\nExample: itunes Alibi',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query || query.trim() === '') {
      await sendMessage(senderId, {
        text: '🎵 *iTunes Music Search* 🎵\n\n🔍 *Enter a song or artist to search for!*\n\n📌 Example: itunes Alibi'
      }, pageAccessToken);
      return;
    }

    // Send initial "Searching..." message
    await sendMessage(senderId, { text: '🔎 Searching for music on iTunes...' }, pageAccessToken);

    const apiUrl = `${api.hazey}/api/itunes?q=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.itunes) {
        const { url, name, artist, album, release_date, price, length, genre, thumbnail, preview } = response.data.itunes;

        // Send thumbnail image
        if (thumbnail) {
          await sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: { url: thumbnail }
            }
          }, pageAccessToken);
        }

        // Send formatted text response
        const formattedResponse =
          `🎶 *iTunes Music Found!* 🎶\n\n` +
          `🎵 *Song:* ${name}\n` +
          `🎤 *Artist:* ${artist}\n` +
          `💿 *Album:* ${album}\n` +
          `📅 *Release Date:* ${release_date}\n` +
          `⏳ *Duration:* ${length} seconds\n` +
          `💰 *Price:* ${price}\n` +
          `🎼 *Genre:* ${genre}\n\n` +
          `🔗 *Listen on iTunes:* [Click Here](${url})`;

        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);

        // Send song preview as voice message
        if (preview) {
          await sendMessage(senderId, {
            attachment: {
              type: 'audio',
              payload: { url: preview }
            }
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: '❌ No preview available for this song.' }, pageAccessToken);
        }
      } else {
        throw new Error('No results found.');
      }
    } catch (error) {
      console.error('Error in iTunes command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ No music found or an error occurred. Please try again later.'
      }, pageAccessToken);
    }
  }
};
