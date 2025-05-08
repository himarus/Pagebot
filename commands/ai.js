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

    if (!ask) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt. Example: ai generate an anime cat'
      }, pageAccessToken);

      await sendMessage(senderId, {
        text: `📌 Did you know?\n\nThis AI can also analyze and describe images — just reply to any image with your question or prompt!\n\nExample:\nSend a image of a cat, then reply to it with:\n"ai what kind of cat is this?"\n\n⚠ This feature works **only on Messenger** because only Messenger supports message replies.`
      }, pageAccessToken);
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
          const uploadRes = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(images)}`);
          const imgurLink = uploadRes?.data?.uploaded?.image;

          if (imgurLink) {
            await sendMessage(senderId, {
              attachment: {
                type: 'image',
                payload: { url: imgurLink }
              }
            }, pageAccessToken);
          } else {
            await sendMessage(senderId, { text: 'Failed to rehost the image via Imgur.' }, pageAccessToken);
          }
        } catch {
          await sendMessage(senderId, { text: 'Image upload error. Try again later.' }, pageAccessToken);
        }
      }
    } catch {
      await sendMessage(senderId, { text: 'Error processing your request. Please try again later.' }, pageAccessToken);
    }
  }
};
