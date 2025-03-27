const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c'; // Palitan ng iyong Imgbb API Key

module.exports = {
  name: 'remini',
  description: 'Enhance image quality using Remini API.',
  usage: 'remini [Reply to an image]',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event) {
    // Kunin ang image URL mula sa attachment o reply
    let imageUrl = getAttachmentUrl(event) || await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      return sendMessage(senderId, { text: '❗ Please reply to an image to enhance.' }, pageAccessToken);
    }

    try {
      // Notify user
      await sendMessage(senderId, { text: '⏳ Enhancing your image, please wait...' }, pageAccessToken);

      // Send request to Remini API
      const enhanceResponse = await axios.get(`${api.zaik}/api/enhancev1`, {
        params: { url: imageUrl },
        responseType: 'arraybuffer' // Para makuha ang image bilang buffer
      });

      // Encode image to base64
      const base64Image = Buffer.from(enhanceResponse.data, 'binary').toString('base64');

      // Upload to Imgbb
      const imgbbResponse = await axios.post(`https://api.imgbb.com/1/upload`, null, {
        params: {
          key: IMGBB_API_KEY,
          image: base64Image, // Base64 encoded image
        },
      });

      if (imgbbResponse.data.success) {
        const imgbbUrl = imgbbResponse.data.data.url;

        // Send enhanced image via Messenger
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
      console.error('❌ Error in Remini command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ Enhancement failed. Please try again later.' }, pageAccessToken);
    }
  }
};

function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === 'image' ? attachment.payload.url : null;
}

async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error('Error fetching replied image:', error.message || error);
      return null;
    }
  }
  return null;
}
