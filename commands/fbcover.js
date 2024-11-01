const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const api = require('../handles/api');

const pageAccessToken = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover image with user details using their profile picture.',
  usage: 'fbcover fullname | firstname | phone | email | location',
  author: 'chilli',
  async execute(senderId, args) {
    // Check if the user has provided enough details
    if (args.length < 5) {
      await sendMessage(senderId, {
        text: `Please provide all necessary details in the correct format:\n\nfbcover fullname | firstname | phone | email | location\n\nExample:\nfbcover John Doe | John | 09123456789 | john@example.com | New York`
      }, pageAccessToken);
      return;
    }

    const [fullname, firstname, phone, email, location] = args.join(" ").split(" | ");

    // Ensure all fields are provided
    if (!fullname || !firstname || !phone || !email || !location) {
      await sendMessage(senderId, {
        text: `Invalid format. Please use:\n\nfbcover fullname | firstname | phone | email | location\n\nExample:\nfbcover John Doe | John | 09123456789 | john@example.com | New York`
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kenlie}/fbcover?avatar=https://graph.facebook.com/${senderId}/picture?type=large&fullname=${encodeURIComponent(fullname)}&firstname=${encodeURIComponent(firstname)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&location=${encodeURIComponent(location)}`;

    await sendMessage(senderId, { text: 'Generating cover image... Please wait.' }, pageAccessToken);

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating cover image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the cover image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
