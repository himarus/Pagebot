const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error("Error fetching replied image:", error.message || error);
      return null;
    }
  }
  return null;
}

module.exports = {
  name: 'remini',
  description: 'Enhance image quality using Remini API',
  author: 'chill',
  
  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      await sendMessage(senderId, { text: '⚠️ Please reply to an image to enhance.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://renzsuperb.onrender.com/api/enhancev1?url=${encodeURIComponent(imageUrl)}`;
      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: apiUrl, is_reusable: true } 
        } 
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in remini command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ An error occurred while enhancing the image. Please try again.' }, pageAccessToken);
    }
  }
};
