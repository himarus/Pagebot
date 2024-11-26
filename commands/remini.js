const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Upscale or enhance an image using the provided Remini-like API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
        imageUrl = event.message.attachments[0].payload.url;
      } else if (event.message.reply_to && event.message.reply_to.mid) {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
      }
    }

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: `❗ Please send an image or reply to an image with "remini" to upscale it.`
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '✨ Enhancing your image, please wait...'
    }, pageAccessToken);

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.ImageUrl) {
        const enhancedImageUrl = response.data.ImageUrl;

        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: enhancedImageUrl
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error('The API did not return an enhanced image URL.');
      }
    } catch (error) {
      console.error('Error in Remini command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ Error: ${error.message || "Something went wrong while enhancing the image."}`
      }, pageAccessToken);
    }
  }
};

async function getRepliedImage(mid, pageAccessToken) {
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data && data.data.length > 0 && data.data[0].image_data) {
    return data.data[0].image_data.url;
  } else {
    return "";
  }
}
