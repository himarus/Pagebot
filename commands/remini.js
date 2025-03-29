const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c'; // Palitan ng sarili mong ImgBB API Key

module.exports = {
  name: 'remini',
  description: 'Enhance an image using Remini AI.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    try {
      const imageUrl = await getRepliedImage(event, pageAccessToken);

      if (!imageUrl) {
        await sendMessage(senderId, { 
          text: '⚠️ Please reply to an image to enhance it using Remini.\n\nNote: This only works in Messenger, not in FB Lite or unsupported platforms.' 
        }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, { text: '🛠️ Enhancing your image... Please wait.' }, pageAccessToken);

      const apiUrl = `${api.xnil}/xnil/remini?imageUrl=${encodeURIComponent(imageUrl)}`;

      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: apiUrl } 
        } 
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in Remini command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

// Function to fetch replied image and upload to ImgBB
async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });

      const imageData = data?.data?.[0]?.image_data;
      const imageUrl = imageData?.url || imageData?.preview_url || null;

      if (!imageUrl) return null;

      // Upload image to ImgBB to bypass Meta restrictions
      const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', null, {
        params: {
          key: IMGBB_API_KEY,
          image: imageUrl,
        },
      });

      return imgbbResponse.data.success ? imgbbResponse.data.data.url : null;

    } catch (error) {
      console.error("Error fetching or uploading replied image:", error.message || error);
      return null;
    }
  }
  return null;
}
