const axios = require('axios');
const { sendMessage, getRepliedImage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image using the RemoveBG API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    
    if (!imageUrl) {
      if (event.message.reply_to && event.message.reply_to.mid) {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
      } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
        imageUrl = event.message.attachments[0].payload.url;
      }
    }


    if (!imageUrl) {
      return sendMessage(senderId, {
        text: `🚫 Please send an image first, then type "removebg" to remove its background, or reply to an image with "removebg"!`
      }, pageAccessToken);
    }

    
    await sendMessage(senderId, { text: '🔄 Removing background from the image, please wait... 🖼️' }, pageAccessToken);

    try {
      
      const removeBgUrl = `${api.jonelApi}/api/removebg?url=${encodeURIComponent(imageUrl)}`;

      
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: removeBgUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error in removebg command:', error);
      await sendMessage(senderId, {
        text: '❗ An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
