const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover image with user details using their profile picture.',
  usage: 'fbcover fullname | firstname | phone | email | location',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    // Check if the user has provided enough details
    if (args.length < 5) {
      await sendMessage(senderId, {
        text: `Please provide all necessary details in the correct format:\n\nfbcover fullname | firstname | phone | email | location\n\nExample:\nfbcover John Doe | John | 09123456789 | john@example.com | New York`
      }, pageAccessToken);
      return;
    }

    // Fetch user's Facebook profile picture using the provided API
    let avatar;
    try {
      const response = await axios.get(`https://api-canvass.vercel.app/profile?uid=${senderId}`);
      avatar = response.data.avatar; // Adjust according to the API response structure
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      await sendMessage(senderId, {
        text: 'Could not fetch your profile picture. Please make sure your user ID is valid.'
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

    const apiUrl = `${api.kenlie}/fbcover?avatar=${encodeURIComponent(avatar)}&fullname=${encodeURIComponent(fullname)}&firstname=${encodeURIComponent(firstname)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&location=${encodeURIComponent(location)}`;

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
