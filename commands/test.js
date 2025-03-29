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
            
            const trackElements = tracks.map(track => ({
                title: track.title,
                subtitle: `Artist: ${track.artist}\nAlbum: ${track.artist_album}\nDuration: ${Math.floor(track.duration / 60000)}m ${Math.floor((track.duration % 60000) / 1000)}s`,
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
            }));

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
                
                if (!audioUrl.startsWith('https://') || !audioUrl.endsWith('.mp3')) {
                    throw new Error('Invalid audio format');
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
