const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate a futuristic image using the JoshWeb API with an optional model parameter.',
  usage: 'flux <prompt> [model]\nExample: flux dog and cat\nExample with model: flux sunset 3',
  author: 'chill',
  async execute(kupal, chilli, pogi) {
    if (!chilli || chilli.length === 0) {
      await sendMessage(kupal, {
        text: 'Please provide a prompt to generate an image.\n\nUsage:\n flux <prompt> [model]\nExample: flux dog and cat\nExample with model: flux sunset 3'
      }, pogi);
      return;
    }

    const prompt = chilli.slice(0, -1).join(' ');
    const model = isNaN(chilli[chilli.length - 1]) ? 4 : chilli.pop();
    const apiUrl = `${api.joshWebApi}/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

    await sendMessage(kupal, { text: 'Generating image... This may take a few moments. Please wait.' }, pogi);

    try {
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

      await sendMessage(kupal, {
        attachment: {
          type: 'image',
          payload: {
            is_reusable: true,
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      }, pogi);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pogi);
    }
  }
};
