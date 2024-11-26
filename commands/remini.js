const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
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

      // Prepare the file for uploading to Facebook
      const formData = new FormData();
      formData.append('recipient', JSON.stringify({ id: senderId }));
      formData.append('message', JSON.stringify({ attachment: { type: 'image', payload: {} } }));
      formData.append('filedata', fs.createReadStream(tempFilePath));

      // Send the enhanced image using Facebook's Send API
      const facebookResponse = await axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${pageAccessToken}`, formData, {
        headers: formData.getHeaders()
      });

      console.log('Facebook response:', facebookResponse.data);

      // Delete the temporary file after sending
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error('Error enhancing image:', error.message || error.response?.data);

      await sendMessage(senderId, {
        text: '🚧 An error occurred while enhancing your image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
