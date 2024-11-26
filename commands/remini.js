const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance or upscale an image using the Kenlie API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '❗ No attachment detected. Please send an image or reply to an image attachment with the command "remini".'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '✨ Enhancing your image, please wait...'
    }, pageAccessToken);

    try {
      const response = await axios.get(`https://api.kenliejugarap.com/imgrestore/?imgurl=${encodeURIComponent(imageUrl)}`, {
        responseType: 'arraybuffer'
      });

      // Save the enhanced image to a temporary file
      const tempFilePath = path.join(__dirname, '../temp', `${Date.now()}-enhanced.jpg`);
      fs.writeFileSync(tempFilePath, response.data);

      // Send the enhanced image as an attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {}
        },
        filedata: fs.createReadStream(tempFilePath)
      }, pageAccessToken);

      // Delete the temporary file after sending
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error('Error enhancing image:', error.message || error);

      await sendMessage(senderId, {
        text: '🚧 An error occurred while enhancing your image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
