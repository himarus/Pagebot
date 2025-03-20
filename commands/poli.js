const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const IMGBB_API_KEY = '79310ecb7673ce380ebd7c46652e3b9c'; // Get an API key from ImgBB

module.exports = {
  name: 'poli',
  description: 'Generate an image based on the provided prompt using Hazey API.',
  usage: 'poli <prompt>',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation. Example: poli A futuristic robot.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.hazey}/api/poli2?prompt=${encodeURIComponent(prompt)}`;

    try {
      // Indicate that the image is being generated
      await sendMessage(senderId, { text: '⏳ Generating your image, please wait...' }, pageAccessToken);

      // Get the image from the API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      if (!response.data) {
        throw new Error('Invalid API response. No image received.');
      }

      // Convert image to base64
      const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

      // Upload to ImgBB
      const imgBBResponse = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        image: imageBase64,
      });

      if (!imgBBResponse.data || !imgBBResponse.data.data || !imgBBResponse.data.data.url) {
        throw new Error('Failed to upload image to ImgBB.');
      }

      const imageUrl = imgBBResponse.data.data.url;

      // Send the image to Messenger
      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: imageUrl, is_reusable: true } 
        } 
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in poli command:', error.message || error);
      await sendMessage(senderId, { text: 'Error: Could not generate image. Please try again later.' }, pageAccessToken);
    }
  }
};
