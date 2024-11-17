const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();

module.exports = {
  name: "wattpad",
  description: "Interact with Wattpad stories (search, read chapters, list parts).",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const command = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");

    if (!command || !query) {
      return sendMessage(senderId, {
        text: `✨ 𝘞𝘢𝘵𝘵𝘱𝘢𝘥 𝘊𝘰𝘮𝘮𝘢𝘯𝘥𝘴:
- 🔍 𝘚𝘦𝘢𝘳𝘤𝘩: 
   𝘌𝘹: \`wattpad search Hell University\` 
   𝘵𝘰 𝘧𝘪𝘯𝘥 𝘴𝘵𝘰𝘳𝘪𝘦𝘴 𝘣𝘺 𝘵𝘪𝘵𝘭𝘦.

- 📑 𝘓𝘪𝘴𝘵 𝘗𝘢𝘳𝘵𝘴: 
   𝘌𝘹: \`wattpad parts https://www.wattpad.com/story/346558088-hell-university\` 
   𝘵𝘰 𝘷𝘪𝘦𝘸 𝘢𝘭𝘭 𝘱𝘢𝘳𝘵𝘴 𝘰𝘧 𝘢 𝘴𝘵𝘰𝘳𝘺.

- 📖 𝘙𝘦𝘢𝘥 𝘊𝘩𝘢𝘱𝘵𝘦𝘳: 
   𝘌𝘹: \`wattpad read https://www.wattpad.com/1362020763-hell-university-chapter-01\` 
   𝘵𝘰 𝘳𝘦𝘢𝘥 𝘢 𝘴𝘱𝘦𝘤𝘪𝘧𝘪𝘤 𝘤𝘩𝘢𝘱𝘵𝘦𝘳.`
      }, pageAccessToken);
    }

    try {
      switch (command) {
        case "search":
          await searchStories(senderId, query, pageAccessToken);
          break;
        case "parts":
          await listStoryParts(senderId, query, pageAccessToken);
          break;
        case "read":
          await readChapter(senderId, query, pageAccessToken);
          break;
        default:
          sendMessage(senderId, { text: "❓ 𝘜𝘯𝘬𝘯𝘰𝘸𝘯 𝘤𝘰𝘮𝘮𝘢𝘯𝘥. 𝘜𝘴𝘦 'wattpad' 𝘧𝘰𝘳 𝘩𝘦𝘭𝘱." }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error in Wattpad command:", error);
      sendMessage(senderId, { text: `⚠️ 𝘌𝘳𝘳𝘰𝘳: ${error.message}` }, pageAccessToken);
    }
  },
};

async function searchStories(senderId, query, pageAccessToken) {
  try {
    const stories = await scraper.search(query);
    if (!stories.length) {
      return sendMessage(senderId, { text: `🔍 𝘕𝘰 𝘴𝘵𝘰𝘳𝘪𝘦𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 "${query}".` }, pageAccessToken);
    }

    const resultText = stories.slice(0, 5).map((story, index) => (
      `${index + 1}. 𝘛𝘪𝘵𝘭𝘦: ${story.title}\n   𝘈𝘶𝘵𝘩𝘰𝘳: ${story.author}\n   𝘙𝘦𝘢𝘥𝘴: ${story.reads} | 𝘝𝘰𝘵𝘦𝘴: ${story.votes}\n   𝘓𝘪𝘯𝘬: ${story.link}`
    )).join("\n\n");

    sendMessage(senderId, { text: `🔍 𝘚𝘦𝘢𝘳𝘤𝘩 𝘙𝘦𝘴𝘶𝘭𝘵𝘴 𝘧𝘰𝘳 "${query}":\n\n${resultText}` }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to search Wattpad stories.");
  }
}

async function listStoryParts(senderId, storyUrl, pageAccessToken) {
  try {
    const parts = await scraper.getParts(storyUrl);
    if (!parts.length) {
      return sendMessage(senderId, { text: `📑 𝘕𝘰 𝘱𝘢𝘳𝘵𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 𝘵𝘩𝘦 𝘴𝘵𝘰𝘳𝘺.` }, pageAccessToken);
    }

    const partsText = parts.map((part, index) => (
      `${index + 1}. 𝘗𝘢𝘳𝘵: ${part.title}\n   𝘓𝘪𝘯𝘬: ${part.link}`
    )).join("\n\n");

    sendMessage(senderId, { text: `📑 𝘚𝘵𝘰𝘳𝘺 𝘗𝘢𝘳𝘵𝘴:\n\n${partsText}` }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to fetch story parts.");
  }
}

async function readChapter(senderId, chapterUrl, pageAccessToken) {
  try {
    const pages = await scraper.read(chapterUrl);
    if (!pages.length) {
      return sendMessage(senderId, { text: `📖 𝘕𝘰 𝘤𝘰𝘯𝘵𝘦𝘯𝘵 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 𝘵𝘩𝘦 𝘤𝘩𝘢𝘱𝘵𝘦𝘳.` }, pageAccessToken);
    }

    const contentText = pages.map((page) => `𝘗𝘢𝘨𝘦 ${page.pageNumber}:\n${page.content}`).join("\n\n");
    sendMessage(senderId, { text: `📖 𝘊𝘩𝘢𝘱𝘵𝘦𝘳 𝘊𝘰𝘯𝘵𝘦𝘯𝘵:\n\n${contentText}` }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to read the chapter.");
  }
}
