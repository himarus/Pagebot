const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance image quality to HD using an upscale API.',
  author: 'chilli',

  async execute(chilli, kupal, pogi, event, imageUrl) {
    if (!imageUrl) {
      if (event.message.reply_to && event.message.reply_to.mid) {
        try {
          imageUrl = await getAttachments(event.message.reply_to.mid, pogi);
        } catch (error) {
          return sendMessage(chilli, {
            text: 'Failed to retrieve the image from the reply. Please reply to an image.'
          }, pogi);
        }
      } else {
        return sendMessage(chilli, {
          text: 'Please reply to an image for HD enhancement.'
        }, pogi);
      }
    }

    await sendMessage(chilli, { text: 'Enhancing the image to HD, please wait... 🖼️' }, pogi);

    try {
      const upscaleUrl = `https://appjonellccapis.zapto.org/api/upscale?url=${encodeURIComponent(imageUrl)}`;

      await sendMessage(chilli, {
        attachment: {
          type: 'image',
          payload: {
            url: upscaleUrl
          }
        }
      }, pogi);

    } catch (error) {
      console.error('Error enhancing image to HD:', error);
      await sendMessage(chilli, {
        text: 'An error occurred while enhancing the image. Please try again later.'
      }, pogi);
    }
  }
};

async function getAttachments(mid, pogi) {
  if (!mid) {
    throw new Error("No message ID provided.");
  }

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pogi }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      return data.data[0].image_data.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    throw new Error("Failed to retrieve the image.");
  }
}
