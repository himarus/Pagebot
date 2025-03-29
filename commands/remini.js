const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c';

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

async function uploadToImgBB(imageUrl) {
  try {
    const formData = new URLSearchParams();
    formData.append('image', imageUrl);
    formData.append('key', IMGBB_API_KEY);

    const response = await axios.post('https://api.imgbb.com/1/upload', formData);
    return response.data?.data?.url || null;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error.message || error);
    return null;
  }
}

module.exports = {
  name: 'remini',
  description: 'Enhance image quality using Remini API',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      await sendMessage(senderId, { text: '⚠️ Please reply to an image to enhance. This command only works on Messenger.' }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, { text: '⏳ Enhancing image... This may take a minute.' }, pageAccessToken);

    try {
      const apiUrl = `https://renzsuperb.onrender.com/api/enhancev1?url=${encodeURIComponent(imageUrl)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.url) {
        throw new Error("Enhancement failed or no URL returned.");
      }

      const imgBBUrl = await uploadToImgBB(data.url);
      if (!imgBBUrl) {
        throw new Error("Failed to upload image to ImgBB.");
      }

      await sendMessage(senderId, {
        attachment: { type: 'image', payload: { url: imgBBUrl, is_reusable: true } }
      }, pageAccessToken);
      
    } catch (error) {
      console.error('Error in remini command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ An error occurred while enhancing the image. Please try again later.' }, pageAccessToken);
    }
  }
};
