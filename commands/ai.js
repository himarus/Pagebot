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
    const uid = senderId;

    const recognitionNote = `Note: To use AI image recognition, **reply to an image with your prompt**.\n\nThis feature only works on **Messenger**, and not in group replies or comments.`;

    if (!ask) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt. Example: ai generate an anime cat'
      }, pageAccessToken);
      await sendMessage(senderId, { text: recognitionNote }, pageAccessToken);
      return;
    }

    async function getRepliedImage(event, pageAccessToken) {
      if (event.message?.reply_to?.mid) {
        try {
          const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
            params: { access_token: pageAccessToken }
          });
          const imageData = data?.data?.[0]?.image_data;
          return imageData ? imageData.url : null;
        } catch {
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
        try {
          await sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: { url: images }
            }
          }, pageAccessToken);
        } catch {
          try {
            const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=1853a90240cf6cebbfe191fa0112d154`, null, {
              params: { image: images }
            });

            const fallbackImg = imgbbRes.data?.data?.url;
            if (fallbackImg) {
              await sendMessage(senderId, {
                attachment: {
                  type: 'image',
                  payload: { url: fallbackImg }
                }
              }, pageAccessToken);
            } else {
              await sendMessage(senderId, {
                text: 'Failed to rehost the image on ImgBB.'
              }, pageAccessToken);
            }
          } catch {
            await sendMessage(senderId, {
              text: 'Image generation failed. Please try again later.'
            }, pageAccessToken);
          }
        }
      }
    } catch {
      await sendMessage(senderId, {
        text: 'Error processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
