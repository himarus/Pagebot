const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'reimage',
  description: 'Transform an image using the Reimagine API.',
  usage: 'reimage [Attach or Reply to an image]',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      imageUrl = getAttachmentUrl(event) || (await getRepliedImage(event, pageAccessToken));
    }

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '❗ Please attach an image or reply to an image with the command "reimage".'
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: '🔄 Reimagining the image, please wait... 🖼️' }, pageAccessToken);

    try {
      const reimagineUrl = `https://kaiz-apis.gleeze.com/api/reimagine?url=${encodeURIComponent(imageUrl)}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: reimagineUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error transforming image:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

// Function to get the URL of an image from an attachment
function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === 'image' ? attachment.payload.url : null;
}

// Function to get the URL of an image from a replied message
async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error('Error fetching replied image:', error.message || error);
      return null;
    }
  }
  return null;
}
