const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c';

// Function to get the replied image URL
async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      return data?.data?.[0]?.image_data?.url || null;
    } catch (error) {
      console.error("Error fetching replied image:", error.message || error);
      return null;
    }
  }
  return null;
}

module.exports = {
  name: 'remini',
  description: 'Enhance an image using Remini API and send it via Imgbb.',
  usage: 'Reply to an image with "Remini"',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    try {
      // Get the replied image URL
      const imageUrl = await getRepliedImage(event, pageAccessToken);
      if (!imageUrl) {
        await sendMessage(senderId, { text: '❌ Please reply to an image to enhance it.' }, pageAccessToken);
        return;
      }

      // Notify user that enhancement is in progress
      await sendMessage(senderId, { text: '⏳ Enhancing your image, please wait. This may take a minute...' }, pageAccessToken);

      // Enhance image using the API
      const enhancedImageUrl = `${api.zaik}/api/enhancev1?url=${encodeURIComponent(imageUrl)}`;

      // Upload enhanced image to Imgbb
      const imgbbResponse = await axios.post(`https://api.imgbb.com/1/upload`, null, {
        params: {
          key: IMGBB_API_KEY,
          image: enhancedImageUrl, // Direct URL upload
        },
      });

      if (imgbbResponse.data.success) {
        const imgbbUrl = imgbbResponse.data.data.url;

        // Send enhanced image to the user
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: { url: imgbbUrl },
          },
        }, pageAccessToken);
      } else {
        throw new Error('Imgbb upload failed.');
      }

    } catch (error) {
      console.error('Error in remini command:', error.message || error);
      await sendMessage(senderId, { text: '❌ Error: Could not enhance image. Please try again later.' }, pageAccessToken);
    }
  }
};
