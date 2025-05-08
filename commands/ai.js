const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Ask GPT-4o Pro anything, generate images, or recognize replied images.',
  usage: 'ai <prompt>',
  author: 'ownirsv2',

  async execute(senderId, args, pageAccessToken, event) {
    const ask = args.join(' ');
    if (!ask) {
      return sendMessage(senderId, {
        text: 'Please provide a prompt. Example: ai generate an anime cat'
      }, pageAccessToken);
    }

    const uid = senderId;

    async function getRepliedImage(event, pageAccessToken) {
      if (event.message?.reply_to?.mid) {
        try {
          const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
            params: { access_token: pageAccessToken }
          });
          const imageData = data?.data?.[0]?.image_data;
          return imageData ? imageData.url : null;
        } catch (error) {
          return null;
        }
      }
      return null;
    }

    const imageUrl = await getRepliedImage(event, pageAccessToken);

    try {
      const apiUrl = `${api.kaizen}/api/gpt-4o-pro?ask=${encodeURIComponent(ask)}&uid=${uid}${imageUrl ? `&imageUrl=${encodeURIComponent(imageUrl)}` : ''}`;
      const res = await axios.get(apiUrl);
      const { response, images } = res.data;

      await sendMessage(senderId, { text: response }, pageAccessToken);

      if (images) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: { url: images }
          }
        }, pageAccessToken);
      }

      await sendMessage(senderId, {
        text: 'Note: This AI can also recognize image content if you reply to an image with your prompt.\n\n*This feature works only on Messenger.*'
      }, pageAccessToken);

    } catch (error) {
      await sendMessage(senderId, {
        text: 'Error processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
