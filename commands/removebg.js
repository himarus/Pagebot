const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

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
  name: 'removebg',
  description: 'Remove background from an image using Rapido API',
  usage: 'removebg (reply to a photo)',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '⚠️ Please reply to an image you want to remove the background from.\n\n*Note: This command only works when replying to an image message.*\n*Make sure to use the Messenger app (not Facebook Lite) to enable reply detection.*'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '⏳ Removing background, please wait...'
    }, pageAccessToken);

    try {
      const apiUrl = `${api.rapid}/api/remove-background?imageUrl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      const resultUrl = response.data?.result;
      if (resultUrl) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: resultUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('No result from Rapido API');
      }
    } catch (error) {
      console.error('RemoveBG command error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Failed to remove background. Please try again later.'
      }, pageAccessToken);
    }
  }
};
