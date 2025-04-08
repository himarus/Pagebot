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
  name: 'remini',
  description: 'Enhance photo using Remini AI (reply with photo)',
  usage: 'remini (reply to a photo)',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '⚠️ Please reply to a photo you want to enhance.\n\n*Note: This command only works on Messenger. If you’re using Facebook Lite or other platforms, reply detection may not work.*'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '✨ Enhancing your image, please wait...'
    }, pageAccessToken);

    try {
      const apiUrl = `https://ccexplorerapisjonell.vercel.app/api/remini?imageUrl=${encodeURIComponent(imageUrl)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;
      const response = await axios.get(apiUrl);

      if (response.data?.result) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: response.data.result,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Remini command error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Failed to enhance image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
