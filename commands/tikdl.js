const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tiktokdl',
  description: 'Download a TikTok video using a video URL.',
  usage: 'tiktokdl <TikTok video URL>\nExample: tiktokdl https://vt.tiktok.com/ZSjFnGp42/',
  author: 'Churchill',
  async execute(senderId, args, pageAccessToken) {
    const regEx_tiktok = /https:\/\/(www\.|vt\.)?tiktok\.com\//;
    const link = args[0];

    if (!link || !regEx_tiktok.test(link)) {
      await sendMessage(senderId, {
        text: 'Please provide a valid TikTok video URL.\n\nUsage:\n tiktokdl <TikTok video URL>\nExample: tiktokdl https://vt.tiktok.com/ZSjFnGp42/'
      }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, { text: 'Downloading TikTok video... Please wait.' }, pageAccessToken);

    try {
      const apiResponse = await axios.post(`https://www.tikwm.com/api/`, { url: link });
      const data = apiResponse.data.data;

      if (!data || !data.play) {
        await sendMessage(senderId, { text: 'Unable to retrieve video. Please try again with a different link.' }, pageAccessToken);
        return;
      }

      const videoStream = await axios({
        method: 'get',
        url: data.play,
        responseType: 'stream'
      });

      const fileName = `TikTok-${Date.now()}.mp4`;
      const filePath = `./${fileName}`;
      const videoFile = fs.createWriteStream(filePath);

      videoStream.data.pipe(videoFile);

      videoFile.on('finish', async () => {
        console.log('Downloaded video file.');
        
        // Sending the video
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: `file://${filePath}`,  // Local file path
              is_reusable: true
            }
          }
        }, pageAccessToken);

        // Clean up the file after sending
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
          else console.log('Temporary file deleted.');
        });
      });

    } catch (error) {
      console.error('Error downloading TikTok video:', error);
      await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
    }
  }
};
