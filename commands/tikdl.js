const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const regEx_tiktok = /https:\/\/(www\.|vt\.)?tiktok\.com\//;

module.exports = {
  name: 'tikdl',
  description: 'Download a TikTok video using a URL.',
  usage: 'tikdl <TikTok video URL>\nExample: tikdl https://vt.tiktok.com/ZSj2TL73Y',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0 || !regEx_tiktok.test(args[0])) {
      await sendMessage(senderId, {
        text: 'Please provide a valid TikTok video URL.\n\nUsage:\n tikdl <TikTok video URL>\nExample: tikdl https://vt.tiktok.com/ZSj2TL73Y'
      }, pageAccessToken);
      return;
    }

    const videoUrl = args[0];
    const apiUrl = `${api.joshWebApi}/tiktokdl?url=${encodeURIComponent(videoUrl)}`;

    await sendMessage(senderId, { text: 'Downloading TikTok video... Please wait.' }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      console.log('Full API response:', response.data); // Debug: Log the full API response

      // Check if response.data is defined and has the expected properties
      if (response.data && response.data.url) {
        const { url, description } = response.data; // Destructure safely

        // Send the description as a text message
        if (description) {
          await sendMessage(senderId, { text: `Description: ${description}` }, pageAccessToken);
        }

        // Send the video attachment
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: url,
              is_reusable: true
            }
          }
        }, pageAccessToken);

      } else {
        await sendMessage(senderId, {
          text: 'Failed to retrieve the video. The URL may be invalid or unsupported.'
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error downloading TikTok video:', error); // Detailed error log
      await sendMessage(senderId, {
        text: 'An error occurred while downloading the TikTok video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
