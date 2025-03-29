const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c';
const REMINI_API = 'https://renzsuperb.onrender.com/api/enhancev1?url=';

// Function to get replied image URL
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

// Function to upload image to Imgbb
async function uploadToImgbb(imageUrl) {
  try {
    const response = await axios.post(`https://api.imgbb.com/1/upload`, null, {
      params: {
        key: IMGBB_API_KEY,
        image: imageUrl,
      },
    });
    return response.data.success ? response.data.data.url : null;
  } catch (error) {
    console.error("Error uploading to Imgbb:", error.message || error);
    return null;
  }
}

module.exports = {
  name: 'remini',
  description: 'Enhance an image using Remini API and send it via Imgbb.',
  usage: 'Reply to an image with "Remini"',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    try {
      // Get replied image
      const fbImageUrl = await getRepliedImage(event, pageAccessToken);
      if (!fbImageUrl) {
        await sendMessage(senderId, { text: '❌ Please reply to an image to enhance it.' }, pageAccessToken);
        return;
      }

      // Notify user
      await sendMessage(senderId, { text: '⏳ Enhancing your image, please wait. This may take a minute...' }, pageAccessToken);

      // Upload Facebook image to Imgbb
      const imgbbUrl = await uploadToImgbb(fbImageUrl);
      if (!imgbbUrl) {
        throw new Error('Failed to upload to Imgbb.');
      }

      // Enhance image using Remini API
      const enhancedImageUrl = `${REMINI_API}${encodeURIComponent(imgbbUrl)}`;

      // Upload enhanced image to Imgbb
      const finalImageUrl = await uploadToImgbb(enhancedImageUrl);
      if (!finalImageUrl) {
        throw new Error('Failed to upload enhanced image.');
      }

      // Send enhanced image
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: finalImageUrl },
        },
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in remini command:', error.message || error);
      await sendMessage(senderId, { text: '❌ Error: Could not enhance image. Please try again later.' }, pageAccessToken);
    }
  }
};
