const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');
const FormData = require('form-data');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c'; // Gamitin ang sarili mong ImgBB API Key

module.exports = {
  name: 'remini',
  description: 'Enhance an image using Remini AI.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    try {
      const imageUrl = await getRepliedImage(event, pageAccessToken);
      if (!imageUrl) {
        await sendMessage(senderId, { 
          text: '⚠️ Please reply to an image to enhance it using Remini.\n\nNote: This only works in Messenger, not in FB Lite or unsupported platforms.' 
        }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, { text: '🛠️ Enhancing your image... Please wait.' }, pageAccessToken);

      // Upload image to ImgBB via buffer
      const imgbbUrl = await uploadToImgBB(imageUrl);
      if (!imgbbUrl) throw new Error("ImgBB upload failed");

      // Send image to Remini for enhancement
      const enhancedImageUrl = `${api.xnil}/xnil/remini?imageUrl=${encodeURIComponent(imgbbUrl)}`;

      // Upload enhanced image to ImgBB again
      const finalImageUrl = await uploadToImgBB(enhancedImageUrl);
      if (!finalImageUrl) throw new Error("Enhanced ImgBB upload failed");

      // Send final enhanced image to user
      await sendMessage(senderId, { 
        attachment: { type: 'image', payload: { url: finalImageUrl } } 
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in Remini command:', error.message || error);
      await sendMessage(senderId, { text: '⚠️ An error occurred while enhancing the image. Please try again later.' }, pageAccessToken);
    }
  }
};

// Function to fetch replied image and upload via buffer
async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });

      const imageUrl = data?.data?.[0]?.image_data?.url || null;
      return imageUrl ? await uploadToImgBB(imageUrl) : null;

    } catch (error) {
      console.error("Error fetching or uploading replied image:", error.message || error);
      return null;
    }
  }
  return null;
}

// Function to upload image via buffer to ImgBB
async function uploadToImgBB(imageUrl) {
  try {
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary').toString('base64');

    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', imageBuffer);

    const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', form, {
      headers: form.getHeaders(),
    });

    return imgbbResponse.data.success ? imgbbResponse.data.data.url : null;

  } catch (error) {
    console.error("ImgBB Upload Error:", error.message || error);
    return null;
  }
}
