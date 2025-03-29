const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c'; // Replace with your Imgbb API Key

module.exports = {
  name: 'remini',
  description: 'Enhance an image using Remini AI.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    try {
      const imageUrl = await getRepliedImage(event, pageAccessToken);

      if (!imageUrl) {
        await sendMessage(senderId, { text: '⚠️ Please reply to an image to enhance it using Remini.\n\nNote: This only works in Messenger, not in FB Lite or unsupported platforms.' }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, { text: '🛠️ Enhancing your image... Please wait.' }, pageAccessToken);

      const reminiUrl = `${api.xnil}/xnil/remini?imageUrl=${encodeURIComponent(imageUrl)}`;
      const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', null, {
        params: {
          key: IMGBB_API_KEY,
          image: reminiUrl,
        },
      });

      if (imgbbResponse.data.success) {
        const imgbbUrl = imgbbResponse.data.data.url;

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
      console.error('Error in Remini command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while enhancing the image. Please try again later.'
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
