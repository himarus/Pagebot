const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');
const axios = require('axios');
const crypto = require('crypto');

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

function generateCustomUID(senderId) {
  const hash = crypto.createHash('md5').update(senderId).digest('hex');
  const numericUID = parseInt(hash.substring(0, 12), 16).toString().slice(0, 9);
  return numericUID;
}

module.exports = {
  name: 'fbcover',
  description: 'Generate Facebook Cover using replied photo or fallback image + user info.',
  usage: 'Reply to a photo then use: fbcover Name | Subname | sdt | address | email | color',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken, event) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, {
        text: 'Usage: fbcover Name | Subname | sdt | address | email | color\n\nTo use your own photo: Send a photo first, then reply to it with this command.\n\nNote: This feature works only on Messenger app, not FB Lite.'
      }, pageAccessToken);
    }

    const fullText = args.join(' ');
    const parts = fullText.split('|').map(p => p.trim());

    const name = parts[0] || 'Unknown';
    const subname = parts[1] || 'Unknown';
    const sdt = parts[2] || 'n/a';
    const address = parts[3] || 'Earth';
    const email = parts[4] || 'no@email.com';
    const color = parts[5] || 'Cyan';

    const uid = generateCustomUID(senderId);
    let imageUrl = await getRepliedImage(event, pageAccessToken);

    if (!imageUrl) {
      imageUrl = 'https://i.imgur.com/ee7o9ru.jpeg';
    }

    const apiUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${uid}&color=${encodeURIComponent(color)}&imageUrl=${encodeURIComponent(imageUrl)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch {
      await sendMessage(senderId, {
        text: '⚠️ Error generating FB cover. Try again later.'
      }, pageAccessToken);
    }
  }
};
