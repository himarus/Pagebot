const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

async function autoTikTokDownloader(senderId, url, pageAccessToken) {
  try {
    const { data } = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
    if (!data || !data.data || !data.data.play) {
      await sendMessage(senderId, { text: 'Failed to fetch the TikTok video.' }, pageAccessToken);
      return;
    }

    const videoUrl = data.data.play;
    const title = data.data.title || 'TikTok Video';

    const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    if (buffer.length > 25 * 1024 * 1024) {
      await sendMessage(senderId, { text: 'The video is too large to send (limit is 25MB).' }, pageAccessToken);
      return;
    }

    const messageData = {
      attachment: {
        type: 'video',
        payload: {
          is_reusable: true
        }
      }
    };

    const formData = new FormData();
    formData.append('message', JSON.stringify(messageData));
    formData.append('filedata', buffer, {
      filename: 'video.mp4',
      contentType: 'video/mp4'
    });

    const uploadRes = await axios.post(`https://graph.facebook.com/v17.0/me/message_attachments?access_token=${pageAccessToken}`, formData, {
      headers: formData.getHeaders()
    });

    const attachmentId = uploadRes.data.attachment_id;

    const finalMessage = {
      attachment: {
        type: 'video',
        payload: {
          attachment_id: attachmentId
        }
      }
    };

    await sendMessage(senderId, finalMessage, pageAccessToken);
  } catch (error) {
    await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video.' }, pageAccessToken);
  }
}

module.exports = { autoTikTokDownloader };
