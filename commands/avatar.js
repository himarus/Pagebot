const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const pogi = require('../handles/api');

module.exports = {
  name: 'avatar',
  description: 'Generate an avatar image',
  usage: 'avatar <id> | <bgtext> | <signature> | <color>\nExample: avatar 4 | chilli | chillibot | black',
  author: 'chilli',
  async execute(kupal, args, pageAccessToken) {
    const params = args.join(" ").split('|').map(param => param.trim());

    if (params.length < 4) {
      await sendMessage(kupal, {
        text: 'Please provide all required parameters.\n\nUsage:\navatar <id> | <bgtext> | <signature> | <color>\nExample: avatar 4 | chilli | chillibot | black'
      }, pageAccessToken);
      return;
    }

    const id = parseInt(params[0], 10);
    const bgtext = params[1];
    const signature = params[2];
    const color = params[3];

    if (isNaN(id) || id < 1 || id > 800) {
      await sendMessage(kupal, {
        text: 'Invalid ID. Please select a number between 1 and 800.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${pogi.joshWebApi}/canvas/avatarv2?id=${id}&bgtext=${encodeURIComponent(bgtext)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`;

    await sendMessage(kupal, {
      text: `Generating your avatar with ID: ${id}, Background Text: ${bgtext}, Signature: ${signature}, Color: ${color}... Please wait.`
    }, pageAccessToken);

    try {
      await sendMessage(kupal, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error generating avatar:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while generating the avatar. Please try again later.'
      }, pageAccessToken);
    }
  }
};
