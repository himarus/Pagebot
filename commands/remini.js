const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance an image using the Remini API.',
  author: 'Mark Hitsuraan',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    // Check if no image URL is provided and handle it
    if (!imageUrl) {
      if (event.message.reply_to && event.message.reply_to.mid) {
        try {
          // Retrieve the image URL from the replied message's attachment
          imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
        } catch (error) {
          return sendMessage(senderId, {
            text: 'Failed to retrieve the image from the reply. Please try again.'
          }, pageAccessToken);
        }
      } else {
        return sendMessage(senderId, {
          text: 'Please reply to an image to enhance it.'
        }, pageAccessToken);
      }
    }

    // Notify the user that the bot is processing the image
    await sendMessage(senderId, { text: 'Enhancing the image, please wait...' }, pageAccessToken);

    try {
      // Download the image locally
      const imagePath = path.join(__dirname, 'temp_image.jpg');
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      await new Promise((resolve, reject) => {
        const stream = response.data.pipe(fs.createWriteStream(imagePath));
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Call the Remini API with the downloaded image
      const reminiUrl = `https://markdevs69v2-679r.onrender.com/new/api/remini?inputImage=${encodeURIComponent(imagePath)}`;
      const reminiResponse = await axios.get(reminiUrl);
      const processedImageURL = reminiResponse.data.image_data;

      // Send the enhanced image back to the user
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: processedImageURL
          }
        }
      }, pageAccessToken);

      // Clean up by removing the downloaded image
      await fs.remove(imagePath);

    } catch (error) {
      console.error('Error enhancing image:', error.message);
      await sendMessage(senderId, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

// Function to retrieve the attachment URL from a replied message using the Facebook Graph API
async function getAttachments(mid, pageAccessToken) {
  if (!mid) {
    throw new Error("No message ID provided.");
  }

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].payload && data.data[0].payload.url) {
      return data.data[0].payload.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    throw new Error("Failed to retrieve the image.");
  }
}
