const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const { getAttachmentUrl } = require('../handles/graphApi');

module.exports = {
  name: 'remini',
  description: 'Enhance an image using the Kaiz Upscale API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, messageId) {
    try {
      // Get the URL of the replied image using the Graph API
      const repliedImageUrl = await getAttachmentUrl(messageId, pageAccessToken);

      if (!repliedImageUrl) {
        return sendMessage(senderId, {
          text: `Please reply to an image with "remini" to enhance it.`
        }, pageAccessToken);
      }

      await sendMessage(senderId, { text: 'Enhancing the image, please wait... 🖼️' }, pageAccessToken);

      const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(repliedImageUrl)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.url) {
        // Send back the enhanced image
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: response.data.url
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error enhancing image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
