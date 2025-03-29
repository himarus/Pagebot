const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
    name: 'test',
    description: 'Advanced Spotify music player',
    usage: 'test <song title>',
    author: 'chill',

    async execute(senderId, args, pageAccessToken) {
        const query = args.join(' ');

        if (!query) {
            return sendMessage(senderId, {
                text: "Please enter the song title. Example: test your mine"
            }, pageAccessToken);
        }

        try {
            const searchResponse = await axios.get(
              `https://api.zetsu.xyz/search/spotify?q=${encodeURIComponent(query)}`
            );

            if (!searchResponse.data?.status || searchResponse.data.result.length === 0) {
                throw new Error('No tracks found');
            }

            const tracks = searchResponse.data.result.slice(0, 5);
            
            const trackElements = tracks.map(track => {
              const durationMinutes = Math.floor(track.duration / 60000);
              const durationSeconds = Math.floor((track.duration % 60000) / 1000);
              const durationString = `${durationMinutes}m ${durationSeconds}s`;

              return {
                title: track.title,
                subtitle: `Artist: ${track.artist}\nAlbum: ${track.artist_album}\nDuration: ${durationString}`,
                image_url: 'https://i.imgur.com/5OWChRD.jpeg',
                buttons: [
                    {
                        type: 'postback',
                        title: 'Play Full',
                        payload: `PLAY_FULL_${encodeURIComponent(track.direct_url)}`
                    },
                    {
                        type: 'web_url',
                        title: 'View Album',
                        url: track.album_url
                    }
                ]
              };
            });

            await sendMessage(senderId, {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: trackElements
                    }
                }
            }, pageAccessToken);

        } catch (error) {
            console.error('Test Command Error:', error);
            await sendMessage(senderId, {
                text: `Error: ${error.message}`
            }, pageAccessToken);
        }
    },

    async handlePostback(senderId, payload, pageAccessToken) {
        if (payload.startsWith('PLAY_FULL_')) {
            try {
                const audioUrl = decodeURIComponent(payload.substring(10));
                
                // Validate audio URL format more strictly
                if (!audioUrl.startsWith('https://p.scdn.co/mp3-preview/') || !audioUrl.includes('?cid=')) {
                    throw new Error('Invalid audio format or URL structure');
                }

                await sendMessage(senderId, {
                    attachment: {
                        type: 'audio',
                        payload: {
                            url: audioUrl,
                            is_reusable: true
                        }
                    }
                }, pageAccessToken);

            } catch (error) {
                console.error('Audio Playback Error:', error);
                await sendMessage(senderId, {
                    text: "Failed to play audio. Try another song."
                }, pageAccessToken);
            }
        }
    }
};
