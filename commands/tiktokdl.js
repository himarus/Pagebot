const fs = require('fs');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok video by link',
  usage: '-tiktokdl <link>',
  async execute(senderId, args) {
    const url = args.join(' ');
    if (!url.includes('tiktok.com')) {
      await sendMessage(senderId, { text: 'Error: Invalid or missing TikTok URL!' }, token);
      return;
    }

    try {
      const response = await axios.get(`${api.joshWebApi}/tiktokdl?url=${encodeURIComponent(url)}`);
      const data = response.data;

      if (!data || !data.url) {
        await sendMessage(senderId, { text: 'Error: Unable to fetch video. API may have returned invalid data.' }, token);
        console.error('Invalid API response:', data);
        return;
      }

      const videoUrl = data.url;
      const description = data.description || 'No description';
      const author = data.author || 'Unknown';

      await sendMessage(senderId, { text: `🎬 TikTok Video by ${author}\n\n${description}` }, token);
      await sendMessage(
        senderId,
        {
          attachment: {
            type: 'video',
            payload: {
              url: videoUrl,
            },
          },
        },
        token
      );

    } catch (error) {
      console.error('Error fetching TikTok video:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error occurred while trying to fetch the video.' }, token);
    }
  }
};
