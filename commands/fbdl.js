const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); // Import API configuration

module.exports = {
  name: 'fbdl',
  description: 'Download Facebook videos using a given URL',
  usage: 'fbdl <facebook_video_url>',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const videoUrl = args.join(' ');

    if (!videoUrl) {
      return sendMessage(senderId, { text: 'Please provide a Facebook video URL. Example: fbdl <video_url>' }, pageAccessToken);
    }

    await sendMessage(senderId, { text: '⏳ Downloading video, please wait...' }, pageAccessToken);

    const apiUrl = `${api.yakzy}/fbdl?url=${encodeURIComponent(videoUrl)}`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data && response.data.video_url) {
        const videoLink = response.data.video_url;

        // Try sending as video attachment
        try {
          await sendMessage(senderId, {
            attachment: {
              type: 'video',
              payload: { url: videoLink }
            }
          }, pageAccessToken);
        } catch (error) {
          console.warn('Video too large, sending as a link instead.');

          await sendMessage(senderId, {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [
                  {
                    title: 'Download Video',
                    subtitle: 'Click below to download the Facebook video.',
                    buttons: [
                      {
                        type: 'web_url',
                        url: videoLink,
                        title: 'Download'
                      }
                    ]
                  }
                ]
              }
            }
          }, pageAccessToken);
        }
      } else {
        throw new Error('No video found.');
      }
    } catch (error) {
      console.error('Error in fbdl command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ Failed to download the video. Please check the URL or try again later.' }, pageAccessToken);
    }
  }
};
