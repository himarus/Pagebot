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
        text: "⚠️ provide music title\nexample: test your mine"
      }, pageAccessToken);
    }

    try {
      // Stage 1: Search Track
      const searchResponse = await axios.get(`https://api.zetsu.xyz/search/spotify?q=${encodeURIComponent(query)}`);
      
      if (!searchResponse.data.status || searchResponse.data.result.length === 0) {
        throw new Error('Walang nahanap na track');
      }

      // Stage 2: Track Selection Logic
      const validTracks = searchResponse.data.result.filter(track => 
        track.direct_url && track.duration > 60000 // Filter short previews
      );

      if (validTracks.length === 0) {
        throw new Error('Walang available na full track');
      }

      const primaryTrack = validTracks[0];

      // Stage 3: Audio Handling
      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: primaryTrack.direct_url,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      // Stage 4: Track Metadata Display
      await sendMessage(senderId, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: validTracks.slice(0, 3).map(track => ({
              title: track.title,
              subtitle: `Artist: ${track.artist}\nDuration: ${Math.floor(track.duration/1000)}s`,
              image_url: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
              buttons: [
                {
                  type: 'web_url',
                  title: '🎵 Play Full',
                  url: track.direct_url
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
  }
};
