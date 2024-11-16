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

    await new Promise(resolve => setTimeout(resolve, 1000));

    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: 'typing_off',
    }, {
      params: { access_token: pageAccessToken },
    });
  } catch (error) {
    // Handle error silently
  }
}

async function sendButton(text, buttons, senderID, pageAccessToken) {
  const payload = buttons.map(button => ({
    type: button.type || 'postback',
    title: button.title,
    payload: button.payload || null,
    url: button.url || null,
  }));

  const form = {
    recipient: { id: senderID },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: text,
          buttons: payload,
        },
      },
    },
    messaging_type: "RESPONSE",
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/me/messages?access_token=${pageAccessToken}`,
      form
    );
    return response.data;
  } catch (err) {
    // Handle error silently
  }
}

async function sendMessage(senderId, message, pageAccessToken, mid = null) {
  if (!message || (!message.text && !message.attachment)) {
    return;
  }

  async function getRepliedImage(mid) {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      return data.data[0].image_data.url;
    } else {
      return "";
    }
  }

  // Add mark_seen action here
  await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, {
    recipient: { id: senderId },
    sender_action: "mark_seen"
  });

  if (mid) {
    const imageUrl = await getRepliedImage(mid);
    if (imageUrl) {
      message.attachment = {
        type: 'image',
        payload: {
          url: imageUrl,
          is_reusable: true
        }
      };
    }
  }

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

  const messageChunks = message.text ? splitMessage(message.text) : [message.text];

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
        resolve();
      });
    });

    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

module.exports = { sendMessage, sendButton, typingIndicator };
