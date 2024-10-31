const axios = require('axios');
const FormData = require('form-data');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'flux',
  description: 'Generate a futuristic image using the JoshWeb API with an optional model parameter.',
  usage: 'flux <prompt> [model]\nExample: flux dog and cat\nExample with model: flux sunset 3',
  author: 'manyakis',
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
      // Step 1: Fetch the image directly from the API as binary data
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      // Step 2: Create form data for the Facebook Attachment Upload API
      const formData = new FormData();
      formData.append('message', JSON.stringify({ attachment: { type: 'image' } }));
      formData.append('filedata', response.data, { filename: 'image.jpg', contentType: 'image/jpeg' });

      // Step 3: Upload image to Facebook and retrieve attachment ID
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v21.0/me/message_attachments?access_token=${pogi}`,
        formData,
        { headers: formData.getHeaders() }
      );

      const attachmentId = uploadResponse.data.attachment_id;

      // Step 4: Send the image using the attachment ID
      await sendMessage(kupal, {
        attachment: {
          type: 'image',
          payload: {
            attachment_id: attachmentId
          }
        }
      }, pogi);

    } catch (error) {
      console.error('Error generating or sending image:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pogi);
    }
  }
};
