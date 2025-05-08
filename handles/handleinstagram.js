const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const regEx_ig = /(?:https?:\/\/)?(?:www\.)?(instagram\.com)\/(reel|p|tv)\/[^\s?]+/m;

async function handleInstagramVideo(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  if (regEx_ig.test(messageText)) {
    await sendMessage(senderId, {
      text: 'Downloading your Instagram video, please wait...'
    }, pageAccessToken);

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/insta-dl?url=${encodeURIComponent(messageText)}`;
      const response = await axios.get(apiUrl);
      const data = response.data.result;

      const videoUrl = data.video_url;
      const caption = data.title || 'Instagram Video';
      const thumb = data.thumbnail;
      const views = data.view_count || 0;
      const likes = data.like_count || 0;
      const duration = data.duration ? `${Math.round(data.duration)} sec` : 'Unknown';

      if (!videoUrl) {
        await sendMessage(senderId, {
          text: 'Failed to retrieve the Instagram video URL.'
        }, pageAccessToken);
        return true;
      }

      const templatePreview = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: caption.length > 80 ? caption.substring(0, 77) + '...' : caption,
                image_url: thumb,
                subtitle: `Likes: ${likes} | Views: ${views} | Duration: ${duration}`,
                default_action: {
                  type: 'web_url',
                  url: videoUrl,
                  webview_height_ratio: 'compact'
                }
              }
            ]
          }
        }
      };

      await sendMessage(senderId, templatePreview, pageAccessToken);

      const head = await axios.head(videoUrl);
      const contentLength = head.headers['content-length'];

      if (contentLength && parseInt(contentLength) > 40 * 1024 * 1024) {
        await sendMessage(senderId, {
          text: `The video is larger than 40MB. You can download it directly here:\n${videoUrl}`
        }, pageAccessToken);
        return true;
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: videoUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Instagram Video Download Error:', error.message);
      await sendMessage(senderId, {
        text: 'An error occurred while downloading the Instagram video. Please try again later.'
      }, pageAccessToken);
    }

    return true;
  }

  return false;
}

module.exports = { handleInstagramVideo };
