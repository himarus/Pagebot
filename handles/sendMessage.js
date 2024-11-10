const request = require('request');
const axios = require('axios');

async function typingIndicator(senderId, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: 'typing_on',
    }, {
      params: { access_token: pageAccessToken },
    });

    await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust delay as necessary

    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: 'typing_off',
    }, {
      params: { access_token: pageAccessToken },
    });
  } catch (error) {
    console.error('Error sending typing indicator:', error.message);
  }
}

async function markSeen(senderId, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: "mark_seen"
    }, {
      params: { access_token: pageAccessToken },
    });
  } catch (error) {
    console.error('Error sending mark_seen action:', error.message);
  }
}

function splitMessageIntoChunks(message, chunkSize = 2000) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

async function sendMessage(senderId, message, pageAccessToken) {
  await markSeen(senderId, pageAccessToken);  // Auto-seen action
  await typingIndicator(senderId, pageAccessToken); // Typing indicator

  const payload = {
    recipient: { id: senderId },
    message: {}
  };

  if (message.text) {
    const textChunks = splitMessageIntoChunks(message.text);

    textChunks.forEach((chunk, index) => {
      const chunkPayload = {
        recipient: { id: senderId },
        message: { text: chunk }
      };

      if (index === textChunks.length - 1 && message.quick_replies) {
        chunkPayload.message.quick_replies = message.quick_replies; // Add quick replies only to the last chunk
      }

      setTimeout(() => {
        request({
          url: 'https://graph.facebook.com/v13.0/me/messages',
          qs: { access_token: pageAccessToken },
          method: 'POST',
          json: chunkPayload,
        }, (error, response, body) => {
          if (error) {
            console.error('Error sending message:', error);
          } else if (response.body.error) {
            console.error('Error response:', response.body.error);
          } else {
            console.log(`Message chunk ${index + 1} sent successfully:`, body);
          }
        });
      }, index * 500); // 500 ms delay between chunks
    });
  }

  if (message.attachment) {
    payload.message.attachment = message.attachment;

    request({
      url: 'https://graph.facebook.com/v13.0/me/messages',
      qs: { access_token: pageAccessToken },
      method: 'POST',
      json: payload,
    }, (error, response, body) => {
      if (error) {
        console.error('Error sending attachment:', error);
      } else if (response.body.error) {
        console.error('Error response:', response.body.error);
      } else {
        console.log('Attachment message sent successfully:', body);
      }
    });
  }

  if (message.quick_replies && !message.text) {  // Case if quick replies are sent without text
    payload.message.quick_replies = message.quick_replies;

    request({
      url: 'https://graph.facebook.com/v13.0/me/messages',
      qs: { access_token: pageAccessToken },
      method: 'POST',
      json: payload,
    }, (error, response, body) => {
      if (error) {
        console.error('Error sending quick replies:', error);
      } else if (response.body.error) {
        console.error('Error response:', response.body.error);
      } else {
        console.log('Quick replies sent successfully:', body);
      }
    });
  }
}

module.exports = { sendMessage, typingIndicator, markSeen };
