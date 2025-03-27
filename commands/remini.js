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
    try {
      // Step 1: Kunin ang image URL mula sa attachment o reply
      let imageUrl = await getImageUrl(event, pageAccessToken);

      if (!imageUrl) {
        return sendMessage(senderId, { text: '❗ Please reply to an image to enhance.' }, pageAccessToken);
      }

      // Step 2: Notify user
      await sendMessage(senderId, { text: '⏳ Uploading image, please wait...' }, pageAccessToken);

      // Step 3: Upload image to Imgbb (to shorten URL)
      const imgbbResponse = await axios.post(`https://api.imgbb.com/1/upload`, null, {
        params: { key: IMGBB_API_KEY, image: imageUrl },
      });

      if (!imgbbResponse.data.success) {
        throw new Error('Imgbb upload failed.');
      }

      const shortImageUrl = imgbbResponse.data.data.url;

      // Step 4: Notify user that enhancement is in progress
      await sendMessage(senderId, { text: '✨ Enhancing your image, please wait...' }, pageAccessToken);

      // Step 5: Send request to Remini API with the shorter Imgbb URL
      const enhanceResponse = await axios.get(`${api.zaik}/api/enhancev1`, {
        params: { url: shortImageUrl },
        responseType: 'arraybuffer'
      });

      // Step 6: Encode image to base64 and upload again to Imgbb
      const base64Image = Buffer.from(enhanceResponse.data, 'binary').toString('base64');

      const imgbbEnhancedResponse = await axios.post(`https://api.imgbb.com/1/upload`, null, {
        params: { key: IMGBB_API_KEY, image: base64Image },
      });

      if (!imgbbEnhancedResponse.data.success) {
        throw new Error('Imgbb upload failed for enhanced image.');
      }

      const enhancedImageUrl = imgbbEnhancedResponse.data.data.url;

      // Step 7: Send enhanced image via Messenger
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: enhancedImageUrl },
        },
      }, pageAccessToken);

    } catch (error) {
      console.error('❌ Error in Remini command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ Enhancement failed. Please try again later.' }, pageAccessToken);
    }
  }
};

// Function to get image URL from attachment or replied message
async function getImageUrl(event, pageAccessToken) {
  try {
    // Check if the message contains an image attachment
    const attachment = event.message?.attachments?.[0];
    if (attachment?.type === 'image') {
      return attachment.payload.url;
    }

    // Check if the message is a reply to an image
    if (event.message?.reply_to?.mid) {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });

      return data?.data?.[0]?.payload?.url || null;
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching image URL:', error.message || error);
    return null;
  }
}
