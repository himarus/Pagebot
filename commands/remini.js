const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance image quality to HD using an upscale API.',
  author: 'chilli',

  async execute(chilli, kupal, pogi, event, imageUrl) {
    // Check for an image URL or retrieve from reply
    if (!imageUrl) {
      if (event.message.reply_to && event.message.reply_to.mid) {
        try {
          imageUrl = await getAttachments(event.message.reply_to.mid, pogi);
        } catch (error) {
          console.error('Error retrieving image from reply:', error.message);
          return sendMessage(chilli, {
            text: 'Failed to retrieve the image from the reply. Please reply to an image.'
          }, pogi);
        }
      } else {
        return sendMessage(chilli, {
          text: 'Please reply to an image for HD enhancement.'
        }, pogi);
      }
    }

    // Notify user of the enhancement delay
    await sendMessage(chilli, { text: 'Enhancing the image to HD, this may take a moment... 🖼️' }, pogi);

    // Retry logic and extended timeout
    const upscaleUrl = `https://appjonellccapis.zapto.org/api/upscale?url=${encodeURIComponent(imageUrl)}`;
    let attempts = 3;
    let response;

    while (attempts > 0) {
      try {
        response = await axios.get(upscaleUrl, { timeout: 30000 });  // Set a 30-second timeout
        if (response?.data?.url) break;  // Exit loop on success

      } catch (error) {
        console.error('Error on image enhancement attempt:', error.message);
        if (attempts === 1) {
          return sendMessage(chilli, {
            text: 'An error occurred while enhancing the image. Please try again later.'
          }, pogi);
        }
        // Send periodic update and retry after delay
        await sendMessage(chilli, { text: 'Still working on it, please hold on... ⏳' }, pogi);
        await new Promise(res => setTimeout(res, 5000));  // Wait 5 seconds before retrying
      }
      attempts--;
    }

    // Send enhanced image if successful
    if (response?.data?.url) {
      await sendMessage(chilli, {
        attachment: {
          type: 'image',
          payload: {
            url: response.data.url
          }
        }
      }, pogi);
    } else {
      await sendMessage(chilli, {
        text: 'Failed to retrieve the enhanced image. Please try again later.'
      }, pogi);
    }
  }
};

// Helper function to get the image URL from a message ID
async function getAttachments(mid, pogi) {
  if (!mid) {
    throw new Error("No message ID provided.");
  }

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pogi }
    });

    if (data?.data?.length > 0 && data.data[0]?.image_data?.url) {
      return data.data[0].image_data.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    console.error('Failed to fetch attachments:', error.message);
    throw new Error("Failed to retrieve the image.");
  }
}
