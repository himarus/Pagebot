const fs = require('fs');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok video by link',
  async execute(senderId, args) {
    const url = args.join(' ');
    
    // Check if the URL is valid
    if (!url.includes('tiktok.com')) {
      return sendMessage(senderId, {
        text: 'Error: Invalid or missing TikTok URL!\n\nTo use this command, type:\n\n' +
              'tiktokdl <TikTok link>\n\nExample:\n' +
              'tiktokdl https://www.tiktok.com/@username/video/123456789'
      }, token);
    }

    try {
      // Fetch the video download link
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/tiktok/download?url=${encodeURIComponent(url)}`);
      const videoUrl = data.code === 0 && data.data?.play;

      // Send the video or an error message
      sendMessage(senderId, videoUrl ? 
        { attachment: { type: 'video', payload: { url: videoUrl } } } :
        { text: 'Error: Unable to fetch video.' },
        token
      );
    } catch (error) {
      console.error('Error:', error);
      sendMessage(senderId, { text: 'Error: Unexpected error occurred.' }, token);
    }
  }
};
