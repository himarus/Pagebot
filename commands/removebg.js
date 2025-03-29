const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    try {
      const imageUrl = await getRepliedImage(event, pageAccessToken);

      if (!imageUrl) {
        await sendMessage(senderId, { text: '⚠️ Please reply to an image to remove its background.\n\nNote: This only works in Messenger, not in FB Lite or unsupported platforms.' }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, { text: '⏳ Removing background... Please wait.' }, pageAccessToken);

      const apiUrl = `${api.xnil}/xnil/removebg?image=${encodeURIComponent(imageUrl)}`;

      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: apiUrl } 
        } 
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in RemoveBG command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while removing the background. Please try again later.'
      }, pageAccessToken);
    }
  }
};

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
