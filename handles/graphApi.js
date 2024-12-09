const axios = require('axios');

async function getAttachmentUrl(messageId, pageAccessToken) {
  try {
    const response = await axios.get(`https://graph.facebook.com/v16.0/${messageId}?fields=message,attachments`, {
      headers: { Authorization: `Bearer ${pageAccessToken}` }
    });

    if (response.data.attachments && response.data.attachments.data[0]) {
      const attachment = response.data.attachments.data[0];
      if (attachment.type === 'image') {
        return attachment.payload.url;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching attachment URL:', error);
    return null;
  }
}

module.exports = { getAttachmentUrl };
