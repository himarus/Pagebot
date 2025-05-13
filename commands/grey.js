const axios = require('axios');
const FormData = require('form-data');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error("Error fetching replied image:", error.message || error);
      return null;
    }
  }
  return null;
}

module.exports = {
  name: 'grey',
  description: 'Convert a replied image to greyscale using Hazey API with Imgur bypass.',
  usage: 'grey (reply to an image)',
  author: 'chill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '⚠️ Please reply to an image to apply the greyscale effect.\n\n*Note: This command only works when replying to an image message.*\n*Make sure to use the Messenger app (not Facebook Lite) to enable reply detection.*'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '🖤 Applying greyscale filter... please wait.'
    }, pageAccessToken);

    try {
      const hazeyUrl = `${api.hazey}/api/grey?image=${encodeURIComponent(imageUrl)}`;
      console.log('Hazey URL:', hazeyUrl);

      const res = await axios.get(hazeyUrl, { responseType: 'arraybuffer' });
      if (!res.data) throw new Error('Empty image buffer from hazey');

      const base64Image = Buffer.from(res.data, 'binary').toString('base64');
      const imgurUploadUrl = `https://betadash-uploader.vercel.app/imgur`;

      const form = new FormData();
      form.append('image', base64Image);
      form.append('type', 'base64');

      const uploadRes = await axios.post(imgurUploadUrl, form, {
        headers: form.getHeaders()
      });

      const hostedUrl = uploadRes?.data?.uploaded?.image;

      if (!hostedUrl || !/\.(jpg|jpeg|png|gif)$/i.test(hostedUrl)) {
        throw new Error("Imgur upload returned an invalid image URL");
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: hostedUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Grey command error:', error.response?.data || error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Failed to apply greyscale or upload image. Try again later.'
      }, pageAccessToken);
    }
  }
};
