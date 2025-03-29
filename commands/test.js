const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'test',
  description: 'Advanced Spotify music player with full track logic',
  usage: 'test <song title>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, {
        text: "⚠️ Pakilagay ang pangalan ng kanta\nHalimbawa: test your mine"
      }, pageAccessToken);
    }

    try {
      // Stage 1: Search Track
      const searchResponse = await axios.get(`https://api.zetsu.xyz/search/spotify?q=${encodeURIComponent(query)}`);

      if (!searchResponse.data.status || searchResponse.data.result.length === 0) {
        throw new Error('Walang nahanap na track');
      }

      // Stage 2: Display All Tracks
      const tracks = searchResponse.data.result;

      // Stage 3: Track Metadata Display
      await sendMessage(senderId, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: tracks.map(track => ({
              title: track.title,
              subtitle: `Artist: ${track.artist}\nAlbum: ${track.artist_album}\nDuration: ${Math.floor(track.duration / 60000)}m ${Math.floor((track.duration % 60000) / 1000)}s`,
              image_url: this.getAlbumArtUrl(track.album_id), // Call function to get album art URL
              buttons: [
                {
                  type: 'postback',
                  title: '🎵 Play Full',
                  payload: `PLAY_FULL_${track.direct_url}`
                },
                {
                  type: 'web_url',
                  title: '📀 View Album',
                  url: track.album_url
                }
              ]
            }))
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Test Command Error:', error);
      await sendMessage(senderId, {
        text: `❌ Error: ${error.message}`
      }, pageAccessToken);
    }
  },
    // Helper function to fetch album art URL
    async getAlbumArtUrl(albumId) {
        try {
            const albumUrl = `https://api.zetsu.xyz/spotify/album?id=${albumId}`;
            const response = await axios.get(albumUrl);
            if (response.data && response.data.images && response.data.images.length > 0) {
                return response.data.images[0].url; // Return the largest image
            } else {
                return 'https://i.ibb.co/6BRZ1Dg/spotify-logo.png'; // Return a default image URL
            }
        } catch (error) {
            console.error('Error fetching album art:', error);
            return 'https://i.ibb.co/6BRZ1Dg/spotify-logo.png'; // Return a default image URL
        }
    },

  // Handle postbacks for playing full track
  async handlePostback(senderId, payload, pageAccessToken) {
    if (payload.startsWith('PLAY_FULL_')) {
      const audioUrl = payload.substring(10);

      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: audioUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    }
  }
};
