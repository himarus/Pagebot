const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tiktokdl',
  description: 'Download TikTok videos without watermark.',
  usage: 'tiktokdl <TikTok Video URL>',
  author: 'chillibot',

  async execute(senderId, args, pageAccessToken) {
    const videoUrl = args[0];
    const tiktokUrlPattern = /(?:https?:\/\/)?(?:www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vt\.tiktok\.com\/[\w\d]+)/;

    if (!videoUrl || !tiktokUrlPattern.test(videoUrl)) {
      await sendMessage(senderId, {
        text: '❌ Invalid TikTok URL.\n\nUsage: tiktokdl <TikTok Video URL>'
      }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, {
      text: '[⏳] Downloading TikTok video, please wait...'
    }, pageAccessToken);

    try {
      const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.data;

      if (!data || !data.play) {
        await sendMessage(senderId, {
          text: '⚠️ Could not retrieve the video. Please try another link.'
        }, pageAccessToken);
        return;
      }

      const videoResponse = await axios.get(data.play, {
        responseType: 'arraybuffer'
      });

      const tempPath = path.join(__dirname, `temp_${Date.now()}.mp4`);
      fs.writeFileSync(tempPath, videoResponse.data);

      const form = new FormData();
      form.append('message', `✅ Video found!\n\n📌 Title: ${data.title || 'N/A'}\n👤 Author: ${data.author?.nickname || 'Unknown'}`);
      form.append('filedata', fs.createReadStream(tempPath));

      const facebookRes = await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        form,
        { headers: form.getHeaders(), params: { recipient: JSON.stringify({ id: senderId }) } }
      );

      fs.unlinkSync(tempPath); // Clean up temp file

    } catch (error) {
      console.error('Force download error:', error.message || error);
      await sendMessage(senderId, {
        text: '❌ Something went wrong while downloading the video. Try again later.'
      }, pageAccessToken);
    }
  }
};
