const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');
const axios = require('axios');

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
  name: 'ghibli',
  description: 'Convert replied image into Ghibli style using AI',
  usage: 'ghibli (reply to an image in Messenger)',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '⚠️ Please reply to an image using Messenger.\n\nNote: This command only works if you reply directly to an image using Messenger (not IG or other platforms).'
      }, pageAccessToken);
    }

    const prompt = encodeURIComponent('Turn this image into ghibli style');
    const encodedImgUrl = encodeURIComponent(imageUrl);
    const ghibliApiUrl = `{api.zaik}/api/4o-image?prompt=${prompt}&img=${encodedImgUrl}`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: ghibliApiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error("Error sending Ghibli image:", error.message || error);
      await sendMessage(senderId, {
        text: 'Error: Could not generate Ghibli-style image.'
      }, pageAccessToken);
    }
  }
};
