const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'poli',
  description: 'Generate an AI image using a prompt.',
  usage: 'poli <prompt>',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');

    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Please provide a prompt.\nExample: poli Dog'
      }, pageAccessToken);
    }

    const imageUrl = `${api.rapid}/api/pollinations?prompt=${encodeURIComponent(prompt)}`;

    await sendMessage(senderId, {
      attachment: {
        type: 'image',
        payload: {
          url: imageUrl,
          is_reusable: true
        }
      }
    }, pageAccessToken);
  }
};
