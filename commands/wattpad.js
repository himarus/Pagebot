const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();

// Cache to store story parts for quick access
const storyPartsCache = {};

module.exports = {
  name: "wattpad",
  description: "Interact with Wattpad stories (search, read chapters, list parts).",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const mainArg = args[0]?.toLowerCase();
    const query = args.join(" ");

    if (!mainArg) {
      return sendMessage(senderId, {
        text: `✨ 𝘞𝘢𝘵𝘵𝘱𝘢𝘥 𝘊𝘰𝘮𝘮𝘢𝘯𝘥𝘴:
- 📚 𝘚𝘦𝘢𝘳𝘤𝘩: \`wattpad [title]\` 𝘵𝘰 𝘴𝘦𝘢𝘳𝘤𝘩 𝘧𝘰𝘳 𝘴𝘵𝘰𝘳𝘪𝘦𝘴.
- 📑 𝘓𝘪𝘴𝘵 𝘗𝘢𝘳𝘵𝘴: \`wattpad parts [story number]\` 𝘵𝘰 𝘷𝘪𝘦𝘸 𝘴𝘵𝘰𝘳𝘺 𝘱𝘢𝘳𝘵𝘴.
- 📖 𝘙𝘦𝘢𝘥 𝘚𝘵𝘰𝘳𝘺: \`wattpad read [story number]\` 𝘵𝘰 𝘳𝘦𝘢𝘥 𝘵𝘩𝘦 𝘧𝘪𝘳𝘴𝘵 𝘱𝘢𝘳𝘵 𝘰𝘧 𝘢 𝘴𝘵𝘰𝘳𝘺.`,
      }, pageAccessToken);
    }

    try {
      if (mainArg === "parts") {
        await listStoryParts(senderId, args.slice(1).join(" "), pageAccessToken);
      } else if (mainArg === "read") {
        await readChapter(senderId, args.slice(1).join(" "), pageAccessToken);
      } else {
        await searchStories(senderId, query, pageAccessToken);
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

    sendMessage(senderId, {
      text: `🔍 𝘚𝘦𝘢𝘳𝘤𝘩 𝘙𝘦𝘴𝘶𝘭𝘵𝘴 𝘧𝘰𝘳 "${query}":\n\n${resultText}\n\n📑 𝘜𝘴𝘦: \`wattpad parts [story number]\` 𝘵𝘰 𝘷𝘪𝘦𝘸 𝘱𝘢𝘳𝘵𝘴.`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to search Wattpad stories.");
  }
}

async function listStoryParts(senderId, storyNumber, pageAccessToken) {
  try {
    const storyUrl = `https://www.wattpad.com/story/${storyNumber}`;
    const parts = await scraper.getParts(storyUrl);
    
    if (!parts.length) {
      return sendMessage(senderId, { text: `📑 𝘕𝘰 𝘱𝘢𝘳𝘵𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 𝘵𝘩𝘦 𝘴𝘵𝘰𝘳𝘺.` }, pageAccessToken);
    }

    // Cache the story parts for quick access later
    storyPartsCache[storyNumber] = parts;

    const partsText = parts.map((part, index) => (
      `${index + 1}. 𝘗𝘢𝘳𝘵: ${part.title}\n   𝘓𝘪𝘯𝘬: ${part.link}`
    )).join("\n\n");

    sendMessage(senderId, {
      text: `📑 𝘚𝘵𝘰𝘳𝘺 𝘗𝘢𝘳𝘵𝘴:\n\n${partsText}\n\n📖 𝘜𝘴𝘦: \`wattpad read [story number]\` 𝘁𝘰 𝘳𝘊𝘦𝘢𝘥 𝘧𝘪𝘳𝘴𝘵 𝘱𝘢𝘳𝘵.`,
    }, pageAccessToken);
  } catch (error) {
    console.error("Error in listStoryParts:", error);
    throw new Error("Failed to fetch story parts.");
  }
}

async function readChapter(senderId, storyNumber, pageAccessToken) {
  try {
    const parts = storyPartsCache[storyNumber];

    if (!parts || parts.length === 0) {
      return sendMessage(senderId, { text: `⚠️ 𝘕𝘰 𝘱𝘢𝘳𝘵𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 𝘵𝘩𝘪𝘴 𝘴𝘵𝘰𝘳𝘺. 𝘕𝘰𝘸 𝘱𝘭𝘦𝘢𝘴𝘦 𝘶𝘴𝘦 \`wattpad parts [story number]\` 𝘵𝘰 𝘷𝘪𝘦𝘸 𝘢𝘭𝘭 𝘱𝘢𝘳𝘵𝘴.` }, pageAccessToken);
    }

    const selectedPart = parts[0]; // Always read the first part
    const pages = await scraper.read(selectedPart.link);

    if (!pages.length) {
      return sendMessage(senderId, { text: `📖 𝘕𝘰 𝘤𝘰𝘯𝘵𝘦𝘯𝘵 𝘧𝘰𝘳 𝘵𝘩𝘪𝘴 𝘱𝘢𝘳𝘵.` }, pageAccessToken);
    }

    const contentText = pages.map((page) => `𝘗𝘢𝘨𝘦 ${page.pageNumber}:\n${page.content}`).join("\n\n");
    sendMessage(senderId, { text: `📖 𝘊𝘩𝘢𝘱𝘵𝘦𝘳 𝘊𝘰𝘯𝘵𝘦𝘯𝘵:\n\n${contentText}` }, pageAccessToken);
  } catch (error) {
    console.error("Error in readChapter:", error);
    throw new Error("Failed to read the chapter.");
  }
}
