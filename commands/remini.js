const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c';

async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      return data?.data?.[0]?.image_data?.url || null;
    } catch (error) {
      console.error("Error fetching replied image:", error.message || error);
      return null;
    }
  }
  return null;
}

module.exports = {
  name: 'remini',
  description: 'Enhance an image using Remini API and send it via ImgBB.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      await sendMessage(senderId, { text: '⚠️ Please reply to an image to enhance. This command only works on Messenger.' }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, { text: '⏳ Enhancing image... This may take a minute.' }, pageAccessToken);

    try {
      // Step 1: Enhance Image
      const enhanceUrl = `https://renzsuperb.onrender.com/api/enhancev1?url=${encodeURIComponent(imageUrl)}`;
      const enhanceResponse = await axios.get(enhanceUrl);

      if (!enhanceResponse.data?.output) {
        throw new Error('Enhancement failed or no valid output.');
      }

      // Step 2: Upload to ImgBB
      const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', null, {
        params: { key: IMGBB_API_KEY, image: enhanceResponse.data.output },
      });

      if (!imgbbResponse.data.success) {
        throw new Error('ImgBB upload failed.');
      }

      // Step 3: Send the enhanced image
      await sendMessage(senderId, {
        attachment: { type: 'image', payload: { url: imgbbResponse.data.data.url } },
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in remini command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ An error occurred while enhancing the image. Please try again later.' }, pageAccessToken);
    }
  }
};
