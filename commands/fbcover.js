const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');
const crypto = require('crypto');

// Custom UID generator from senderId
function generateCustomUID(senderId) {
  const hash = crypto.createHash('md5').update(senderId).digest('hex');
  const numericUID = parseInt(hash.substring(0, 12), 16).toString().slice(0, 9);
  return numericUID;
}

module.exports = {
  name: 'fbcover',
  description: 'Generate Facebook Cover using user info.',
  usage: 'fbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, {
        text: 'Usage: fbcover Name | Subname | sdt | address | email | color'
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
    const apiUrl = `${api.josh}/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${uid}&color=${encodeURIComponent(color)}&apikey=05b1c379d5886d1b846d45572ee1e0ef`;

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('FB Cover Error:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ Error generating FB cover. Please try again later.'
      }, pageAccessToken);
    }
  }
};
