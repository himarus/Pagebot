const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover photo using user details.',
  usage: 'fbcover <name> | <subname> | <phone> | <address> | <email> | <color>\nExample: fbcover John | Doe | N/A | USA | john.doe@gmail.com | Cyan',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' '); // Combine all arguments into one string
    const parts = input.split('|').map(part => part.trim()); // Split by `|` and trim whitespace

    // Validate input
    if (parts.length < 6) {
      await sendMessage(senderId, {
        text: `❗ Invalid input. Please provide all details separated by " | ":\n\nUsage: fbcover <name> | <subname> | <phone> | <address> | <email> | <color>\nExample: fbcover John | Doe | N/A | USA | john.doe@gmail.com | Cyan`
      }, pageAccessToken);
      return;
    }

    // Parse input details
    const [name, subname, phone, address, email, color] = parts;

    // Construct API URL
    const apiUrl = `https://joshweb.click/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${senderId}&color=${encodeURIComponent(color)}`;

    try {
      // Notify the user that the cover is being generated
      await sendMessage(senderId, {
        text: `🎨 Generating Facebook cover photo for ${name} ${subname}... Please wait.`
      }, pageAccessToken);

      // Send the generated cover photo
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error in fbcover command:', error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while generating the Facebook cover photo. Please try again later.'
      }, pageAccessToken);
    }
  }
};
