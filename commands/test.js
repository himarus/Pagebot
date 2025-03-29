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
            //Limit tracks to top 5 
            const limitedTracks = tracks.slice(0,5);

            // Stage 3: Track Metadata Display
            await sendMessage(senderId, {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: limitedTracks.map(track => ({
                            title: track.title,
                            subtitle: `Artist: ${track.artist}\nAlbum: ${track.artist_album}\nDuration: ${Math.floor(track.duration / 60000)}m ${Math.floor((track.duration % 60000) / 1000)}s`,
                            image_url: 'https://i.imgur.com/5OWChRD.jpeg', // Set default image URL
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
