const axios = require('axios');
const FormData = require('form-data'); // Ensure you have installed this: npm install form-data
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'reimage',
  description: 'Transform an image using the Reimagine API.',
  usage: 'reimage [Attach or Reply to an image]',
  author: 'churchill',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      imageUrl = getAttachmentUrl(event) || (await getRepliedImage(event, pageAccessToken));
    }

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: '❗ Please attach an image or reply to an image with the command "reimage".',
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: '🔄 Reimagining the image, please wait... 🖼️' }, pageAccessToken);

    try {
      // Fetch the reimagined image from the API
      const reimagineUrl = `https://kaiz-apis.gleeze.com/api/reimagine?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(reimagineUrl, { responseType: 'arraybuffer' });

      // Save the image as a buffer
      const imageBuffer = Buffer.from(response.data, 'binary');

      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Image buffer is empty or invalid.');
      }

      // Upload the image to Facebook
      const uploadResult = await uploadAttachment(imageBuffer, pageAccessToken);

      if (uploadResult.error || !uploadResult.attachment_id) {
        throw new Error('Attachment upload failed.');
      }

      // Send the uploaded image to the user
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            attachment_id: uploadResult.attachment_id,
          },
        },
      }, pageAccessToken);
    } catch (error) {
      console.error('Error transforming image:', error.response?.data || error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing the image. Please try again later.',
      }, pageAccessToken);
    }
  },
};

// Function to get the URL of an image from an attachment
function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === 'image' ? attachment.payload.url : null;
}

// Function to get the URL of an image from a replied message
async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken },
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error('Error fetching replied image:', error.response?.data || error.message || error);
      return null;
    }
  }
  return null;
}

// Function to upload the image buffer as an attachment to Facebook
async function uploadAttachment(imageBuffer, pageAccessToken) {
  try {
    const formData = new FormData();
    formData.append('filedata', imageBuffer, { filename: 'reimagined_image.jpg', contentType: 'image/jpeg' });
    formData.append('access_token', pageAccessToken);

    const { data } = await axios.post(
      'https://graph.facebook.com/v21.0/me/message_attachments',
      formData,
      { headers: formData.getHeaders() }
    );

    return data;
  } catch (error) {
    console.error('Error uploading attachment:', error.response?.data || error.message || error);
    return { error: true };
  }
}
