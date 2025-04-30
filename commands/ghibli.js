const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');
const axios = require('axios');

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

async function uploadToImgBB(imageUrl) {
  const imgbbApiKey = '1853a90240cf6cebbfe191fa0112d154';
  const imgbbEndpoint = 'https://api.imgbb.com/1/upload';

  try {
    const res = await axios.post(`${imgbbEndpoint}?key=${imgbbApiKey}`, null, {
      params: {
        image: imageUrl
      }
    });

    return res.data?.data?.url || null;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error.message || error);
    return null;
  }
}

module.exports = {
  name: 'ghibli',
  description: 'Convert replied image into Ghibli style using AI',
  usage: 'ghibli (reply to an image in Messenger)',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken, event) {
    const imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '⚠️ Please reply to an image using Messenger.'
      }, pageAccessToken);
    }

    const prompt = encodeURIComponent('Turn this image into ghibli style');
    const encodedImgUrl = encodeURIComponent(imageUrl);
    const ghibliApiUrl = `${api.zaik}/api/4o-image?prompt=${prompt}&img=${encodedImgUrl}`;

    try {
      const imgbbUrl = await uploadToImgBB(ghibliApiUrl);

      if (!imgbbUrl) {
        throw new Error('Failed to upload generated image to ImgBB');
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: imgbbUrl }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error sending Ghibli image:", error.message || error);
      await sendMessage(senderId, {
        text: 'Error: Could not generate or send Ghibli-style image.'
      }, pageAccessToken);
    }
  }
};
