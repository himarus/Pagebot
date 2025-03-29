const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

// ImgBB API Key
const imgbbApiKey = '79310ecb7673ce380ebd7c46652e3b9c';

// Function to upload image to ImgBB
async function uploadImageToImgBB(imageUrl) {
  try {
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      image: imageUrl
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error.message || error);
    return null;
  }
}

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

      // Upload image to ImgBB
      const imgbbImageUrl = await uploadImageToImgBB(imageUrl);

      if (!imgbbImageUrl) {
        throw new Error('Failed to upload image to ImgBB.');
      }

      // Use ImgBB URL for Remini API
      const apiUrl = `${api.xnil}/xnil/remini?imageUrl=${encodeURIComponent(imgbbImageUrl)}`;

      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: apiUrl } 
        } 
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in Remini command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
