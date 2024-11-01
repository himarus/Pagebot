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
      
      // Check if the response contains a valid play link
      const videoUrl = data.data?.play;

      // Send the video or an error message if play URL is missing
      if (videoUrl) {
        sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: { url: videoUrl }
          }
        }, token);
      } else {
        sendMessage(senderId, { text: 'Error: Unable to fetch video.' }, token);
      }
    } catch (error) {
      console.error('Error:', error);
      sendMessage(senderId, { text: 'Error: Unexpected error occurred.' }, token);
    }
  }
};
