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

    // Add delay here if needed to simulate typing
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

async function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment)) {
    console.error('Error: Message must provide valid text or attachment.');
    return;
  }

  // Function to split the message into chunks of max 2000 characters
  function splitMessage(text) {
    const maxLength = 2000;
    const messages = [];
    let remainingText = text;

    while (remainingText.length > maxLength) {
      let splitIndex = remainingText.lastIndexOf("\n", maxLength);
      if (splitIndex === -1) {
        splitIndex = maxLength;
      } else {
        splitIndex += 1;
      }

      messages.push(remainingText.slice(0, splitIndex).trim());
      remainingText = remainingText.slice(splitIndex).trim();
    }

    messages.push(remainingText);
    return messages;
  }

  // Split text if it's too long
  const messageChunks = message.text ? splitMessage(message.text) : [message.text];

  // Send each message chunk sequentially
  for (const chunk of messageChunks) {
    const payload = {
      recipient: { id: senderId },
      message: { text: chunk },
    };

    if (message.attachment && chunk === messageChunks[messageChunks.length - 1]) {
      payload.message.attachment = message.attachment;
    }

    if (message.quick_replies && chunk === messageChunks[messageChunks.length - 1]) {
      payload.message.quick_replies = message.quick_replies;
    }

    await typingIndicator(senderId, pageAccessToken);

    await new Promise((resolve) => {
      request({
        url: 'https://graph.facebook.com/v13.0/me/messages',
        qs: { access_token: pageAccessToken },
        method: 'POST',
        json: payload,
      }, (error, response, body) => {
        if (error) {
          console.error('Error sending message:', error);
        } else if (response.body.error) {
          console.error('Error response:', response.body.error);
        } else {
          console.log('Message sent successfully:', body);
        }
        resolve();
      });
    });

    // Optional delay between message chunks
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

module.exports = { sendMessage, typingIndicator };
