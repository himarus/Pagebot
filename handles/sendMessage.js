const axios = require('axios');
const request = require('request');

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
    console.error("Error in typing indicator:", error?.message || error, error?.stack);
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
    console.error("Error sending button message:", err?.response?.data || err?.message || err, err?.stack);
  }
}

async function sendMessage(senderId, message, pageAccessToken, mid = null) {
  if (!message || (!message.text && !message.attachment)) {
    return;
  }

  async function getRepliedImage(mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });

      if (data?.data?.length > 0 && data.data[0]?.payload?.url) {
        return data.data[0].payload.url;
      } else {
        throw new Error("No image found in the replied message.");
      }
    } catch (error) {
      console.error("Error fetching replied image:", error?.message || error, error?.stack);
      return "";
    }
  }

  try {
    await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, {
      recipient: { id: senderId },
      sender_action: "mark_seen"
    });
  } catch (error) {
    console.error("Error marking message as seen:", error?.message || error, error?.stack);
  }

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

    try {
      await typingIndicator(senderId, pageAccessToken);

      await new Promise((resolve) => {
        request({
          url: 'https://graph.facebook.com/v13.0/me/messages',
          qs: { access_token: pageAccessToken },
          method: 'POST',
          json: payload,
        }, (error, response, body) => {
          if (error) {
            console.error("Error sending message:", error);
          } else if (response.statusCode !== 200) {
            console.error("Non-200 response:", body);
          }
          resolve();
        });
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error sending message chunk:", error?.message || error, error?.stack);
    }
  }
}

module.exports = { sendMessage, sendButton, typingIndicator };
