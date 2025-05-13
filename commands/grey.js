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
  name: 'grey',
  description: 'Convert a replied image to greyscale using Hazey API.',
  usage: 'greyscale (reply to an image)',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '⚠️ Please reply to an image to apply the greyscale effect.\n\n*Note: This command only works when replying to an image message.*\n*Make sure to use the Messenger app (not Facebook Lite) to enable reply detection.*'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '🖤 Applying grey filter... please wait.'
    }, pageAccessToken);

    try {
      const resultUrl = `${api.hazey}/api/grey?image=${encodeURIComponent(imageUrl)}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: resultUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Greyscale command error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Failed to apply greyscale effect. Please try again later.'
      }, pageAccessToken);
    }
  }
};
