const fs = require('fs');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok video by link',
  usage: '-tiktokdl <link>',
  async execute(senderId, args) {
    const url = args.join(' ');
    if (!url.includes('tiktok.com')) return sendMessage(senderId, { text: 'Error: Invalid or missing TikTok URL!' }, token);

    try {
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/tiktok/download?url=${encodeURIComponent(url)}`);
      const videoUrl = data.code === 0 && data.data?.play;
      sendMessage(senderId, videoUrl ? { attachment: { type: 'video', payload: { url: videoUrl } } } : { text: 'Error: Unable to fetch video.' }, token);
    } catch (error) {
      console.error('Error:', error);
      sendMessage(senderId, { text: 'Error: Unexpected error occurred.' }, token);
    }
  }
};
