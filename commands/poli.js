const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

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
      // Sending a message to indicate that the image is being generated
      await sendMessage(senderId, { text: '⏳ Generating your image, please wait...' }, pageAccessToken);

      // Sending the generated image
      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: apiUrl } 
        } 
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in poli command:', error.message || error);
      await sendMessage(senderId, { text: 'Error: Could not generate image. Please try again later.' }, pageAccessToken);
    }
  }
};
