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

    await new Promise(resolve => setTimeout(resolve, 1000)); // Optional delay

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

function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment)) {
    console.error('Error: Message must provide valid text or attachment.');
    return;
  }

  const payload = {
    recipient: { id: senderId },
    message: {}
  };

  if (message.text) {
    payload.message.text = message.text;
  }

  if (message.attachment) {
    payload.message.attachment = message.attachment;
  }

  typingIndicator(senderId, pageAccessToken);

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
  });
}

async function handleTikTokDownload(senderId, url, pageAccessToken) {
  try {
    const response = await axios.get(`https://www.tikwm.com/api/`, {
      params: { url: url }
    });

    const videoUrl = response.data.data?.play ?? null;

    if (videoUrl) {
      sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: { url: videoUrl, is_reusable: true }
        }
      }, pageAccessToken);
    } else {
      sendMessage(senderId, { text: 'Unable to fetch video.' }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error fetching TikTok video:', error.message);
    sendMessage(senderId, { text: 'An error occurred while fetching the TikTok video.' }, pageAccessToken);
  }
}

module.exports = async function handleMessage(event, pageAccessToken) {
  const messageText = event.message.text;
  const senderId = event.sender.id;

  const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;
  const match = messageText.match(tiktokRegex);

  if (messageText.startsWith('Tiktokdl') && match) {
    const tiktokUrl = match[0];
    await handleTikTokDownload(senderId, tiktokUrl, pageAccessToken);
  } else {
    sendMessage(senderId, { text: 'Please send a valid TikTok URL with the command "Tiktokdl".' }, pageAccessToken);
  }
};
