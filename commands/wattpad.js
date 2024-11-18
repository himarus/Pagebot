const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();

module.exports = {
  name: "wattpad",
  description: "Interact with Wattpad stories (search, read chapters, list parts).",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const mainArg = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");

    if (!mainArg) {
      return sendMessage(senderId, {
        text: `✨ 𝘞𝘢𝘵𝘵𝘱𝘢𝘥 𝘊𝘰𝘮𝘮𝘢𝘯𝘥𝘴:
- 📚 𝘚𝘦𝘢𝘳𝘤𝘩 (𝘋𝘦𝘧𝘢𝘶𝘭𝘵): 
   𝘛𝘺𝘱𝘦 \`wattpad [title]\` 𝘵𝘰 𝘧𝘪𝘯𝘥 𝘴𝘵𝘰𝘳𝘪𝘦𝘴.

- 📑 𝘓𝘪𝘴𝘵 𝘗𝘢𝘳𝘵𝘴: 
   𝘌𝘹: \`wattpad parts [story number]\` 
   𝘵𝘰 𝘷𝘪𝘦𝘸 𝘢𝘭𝘭 𝘱𝘢𝘳𝘵𝘴 𝘰𝘧 𝘢 𝘴𝘵𝘰𝘳𝘺.

- 📖 𝘙𝘦𝘢𝘥 𝘊𝘩𝘢𝘱𝘵𝘦𝘳: 
   𝘌𝘹: \`wattpad read [story number] [part number]\` 
   𝘵𝘰 𝘳𝘦𝘢𝘥 𝘢 𝘴𝘱𝘦𝘤𝘪𝘧𝘪𝘤 𝘤𝘩𝘢𝘱𝘵𝘦𝘳.`,
      }, pageAccessToken);
    }

    try {
      if (mainArg === "parts") {
        await listStoryParts(senderId, query, pageAccessToken);
      } else if (mainArg === "read") {
        await readChapter(senderId, args, pageAccessToken);
      } else {
        await searchStories(senderId, args.join(" "), pageAccessToken);
      }
    } catch (error) {
      console.error("Error in Wattpad command:", error);
      sendMessage(senderId, { text: `⚠️ 𝘌𝘳𝘳𝘰𝘳: ${error.message}` }, pageAccessToken);
    }
  },
};

async function searchStories(senderId, query, pageAccessToken) {
  try {
    if (!query) {
      return sendMessage(senderId, { text: "⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘷𝘢𝘭𝘪𝘥 𝘴𝘦𝘢𝘳𝘤𝘩 𝘲𝘶𝘦𝘳𝘺." }, pageAccessToken);
    }

    const stories = await scraper.search(query);
    if (!stories.length) {
      return sendMessage(senderId, { text: `🔍 𝘕𝘰 𝘴𝘵𝘰𝘳𝘪𝘦𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 "${query}".` }, pageAccessToken);
    }

    // Filter and prioritize results with exact matches
    const filteredStories = stories.filter((story) =>
      story.title.toLowerCase().includes(query.toLowerCase())
    );

    if (!filteredStories.length) {
      return sendMessage(senderId, { text: `🔍 𝘕𝘰 𝘦𝘹𝘢𝘤𝘵 𝘮𝘢𝘵𝘤𝘩𝘦𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 "${query}". 𝘛𝘳𝘺 𝘢 𝘥𝘪𝘧𝘧𝘦𝘳𝘦𝘯𝘵 𝘵𝘪𝘵𝘭𝘦.` }, pageAccessToken);
    }

    const resultText = filteredStories.slice(0, 5).map((story, index) => (
      `${index + 1}. 𝘛𝘪𝘵𝘭𝘦: ${story.title}\n   𝘈𝘶𝘵𝘩𝘰𝘳: ${story.author || "Unknown"}\n   𝘙𝘦𝘢𝘥𝘴: ${story.reads || "N/A"} | 𝘝𝘰𝘵𝘦𝘴: ${story.votes || "N/A"}\n   𝘓𝘪𝘯𝘬: ${story.link}`
    )).join("\n\n");

    sendMessage(senderId, {
      text: `🔍 𝘚𝘦𝘢𝘳𝘤𝘩 𝘙𝘦𝘴𝘶𝘭𝘵𝘴 𝘧𝘰𝘳 "${query}":\n\n${resultText}\n\n📑 𝘜𝘴𝘦: \`wattpad parts [story number]\` 𝘵𝘰 𝘷𝘪𝘦𝘸 𝘱𝘢𝘳𝘵𝘴.`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to search Wattpad stories.");
  }
}

async function listStoryParts(senderId, storyIndex, pageAccessToken) {
  try {
    if (!storyIndex) {
      return sendMessage(senderId, { text: "⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘴𝘵𝘰𝘳𝘺 𝘯𝘶𝘮𝘣𝘦𝘳." }, pageAccessToken);
    }

    const storyUrl = stories[Number(storyIndex) - 1]?.link;
    if (!storyUrl) {
      return sendMessage(senderId, { text: "⚠️ 𝘚𝘵𝘰𝘳𝘺 𝘯𝘶𝘮𝘣𝘦𝘳 𝘪𝘯𝘷𝘢𝘭𝘪𝘥." }, pageAccessToken);
    }

    const parts = await scraper.getParts(storyUrl);
    if (!parts.length) {
      return sendMessage(senderId, { text: `📑 𝘕𝘰 𝘱𝘢𝘳𝘵𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 𝘵𝘩𝘦 𝘴𝘵𝘰𝘳𝘺.` }, pageAccessToken);
    }

    const partsText = parts.map((part, index) => (
      `${index + 1}. 𝘗𝘢𝘳𝘵: ${part.title}\n   𝘓𝘪𝘯𝘬: ${part.link}`
    )).join("\n\n");

    sendMessage(senderId, {
      text: `📑 𝘚𝘵𝘰𝘳𝘺 𝘗𝘢𝘳𝘵𝘴:\n\n${partsText}\n\n📖 𝘜𝘴𝘦: \`wattpad read [story number] [part number]\` 𝘵𝘰 𝘳𝘦𝘢𝘥 𝘢 𝘱𝘢𝘳𝘵.`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to list story parts.");
  }
}

async function readChapter(senderId, args, pageAccessToken) {
  try {
    const [storyIndex, partIndex] = args.slice(1).map(Number);
    if (!storyIndex || !partIndex) {
      return sendMessage(senderId, { text: "⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘷𝘢𝘭𝘪𝘥 𝘴𝘵𝘰𝘳𝘺 𝘢𝘯𝘥 𝘱𝘢𝘳𝘵 𝘯𝘶𝘮𝘣𝘦𝘳𝘴." }, pageAccessToken);
    }

    const storyUrl = stories[storyIndex - 1]?.link;
    const parts = await scraper.getParts(storyUrl);

    const chapter = await scraper.getPart(parts[partIndex - 1]?.link);
    if (!chapter || !chapter.content) {
      return sendMessage(senderId, { text: "⚠️ 𝘍𝘢𝘪𝘭𝘦𝘥 𝘵𝘰 𝘳𝘦𝘢𝘥 𝘵𝘩𝘦 𝘤𝘩𝘢𝘱𝘵𝘦𝘳." }, pageAccessToken);
    }

    sendMessage(senderId, {
      text: `📖 𝘙𝘦𝘢𝘥𝘪𝘯𝘨: ${chapter.title}\n\n${chapter.content.substring(0, 2000)}...`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to read the chapter.");
  }
}
