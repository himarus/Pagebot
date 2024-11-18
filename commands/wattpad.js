const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();
const userContext = {}; // Temporary context storage for each user.

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
   𝘛𝘺𝘱𝘦 \`wattpad parts [story number]\` 
   𝘵𝘰 𝘷𝘪𝘦𝘸 𝘢𝘭𝘭 𝘱𝘢𝘳𝘵𝘴.

- 📖 𝘙𝘦𝘢𝘥 𝘊𝘩𝘢𝘱𝘵𝘦𝘳: 
   𝘛𝘺𝘱𝘦 \`wattpad read [part number]\` 
   𝘵𝘰 𝘳𝘦𝘢𝘥 𝘢 𝘴𝘱𝘦𝘤𝘪𝘧𝘪𝘤 𝘤𝘩𝘢𝘱𝘵𝘦𝘳.`
      }, pageAccessToken);
    }

    try {
      if (mainArg === "parts") {
        await listStoryParts(senderId, args[1], pageAccessToken);
      } else if (mainArg === "read") {
        await readChapter(senderId, args[1], pageAccessToken);
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
    const normalizedQuery = query.trim(); // Normalize input to remove unnecessary spaces
    if (!normalizedQuery) {
      return sendMessage(senderId, { text: "⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘦𝘯𝘵𝘦𝘳 𝘢 𝘷𝘢𝘭𝘪𝘥 𝘲𝘶𝘦𝘳𝘺." }, pageAccessToken);
    }

    const stories = await scraper.search(normalizedQuery);
    if (!stories.length) {
      return sendMessage(senderId, { text: `🔍 𝘕𝘰 𝘴𝘵𝘰𝘳𝘪𝘦𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 "${normalizedQuery}".` }, pageAccessToken);
    }

    // Store results in user context
    userContext[senderId] = { stories };

    // Display all results
    const resultText = stories.map((story, index) => (
      `${index + 1}. 𝘛𝘪𝘵𝘭𝘦: ${story.title}\n   𝘈𝘶𝘵𝘩𝘰𝘳: ${story.author}\n   𝘙𝘦𝘢𝘥𝘴: ${story.reads} | 𝘝𝘰𝘵𝘦𝘴: ${story.votes}`
    )).join("\n\n");

    sendMessage(senderId, {
      text: `🔍 𝘚𝘦𝘢𝘳𝘤𝘩 𝘙𝘦𝘴𝘶𝘭𝘵𝘴 𝘧𝘰𝘳 "${normalizedQuery}":\n\n${resultText}\n\n📑 𝘜𝘴𝘦: \`wattpad parts [story number]\` 𝘵𝘰 𝘷𝘪𝘦𝘸 𝘱𝘢𝘳𝘵𝘴.`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to search Wattpad stories.");
  }
}

async function listStoryParts(senderId, storyIndex, pageAccessToken) {
  try {
    const context = userContext[senderId];
    if (!context || !context.stories) {
      return sendMessage(senderId, { text: `⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘴𝘦𝘢𝘳𝘤𝘩 𝘧𝘪𝘳𝘴𝘵 𝘣𝘺 𝘶𝘴𝘪𝘯𝘨 \`wattpad [title]\`.` }, pageAccessToken);
    }

    const story = context.stories[storyIndex - 1];
    if (!story) {
      return sendMessage(senderId, { text: `⚠️ 𝘐𝘯𝘷𝘢𝘭𝘪𝘥 𝘴𝘵𝘰𝘳𝘺 𝘯𝘶𝘮𝘣𝘦𝘳.` }, pageAccessToken);
    }

    const parts = await scraper.getParts(story.link);
    if (!parts.length) {
      return sendMessage(senderId, { text: `📑 𝘕𝘰 𝘱𝘢𝘳𝘵𝘴 𝘧𝘰𝘶𝘯𝘥 𝘧𝘰𝘳 𝘵𝘩𝘦 𝘴𝘵𝘰𝘳𝘺.` }, pageAccessToken);
    }

    // Store parts in context
    context.parts = parts;

    const partsText = parts.map((part, index) => (
      `${index + 1}. 𝘗𝘢𝘳𝘵: ${part.title}`
    )).join("\n\n");

    sendMessage(senderId, {
      text: `📑 𝘚𝘵𝘰𝘳𝘺 𝘗𝘢𝘳𝘵𝘴:\n\n${partsText}\n\n📖 𝘜𝘴𝘦: \`wattpad read [part number]\` 𝘵𝘰 𝘳𝘦𝘢𝘥 𝘢 𝘤𝘩𝘢𝘱𝘵𝘦𝘳.`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to fetch story parts.");
  }
}

async function readChapter(senderId, partIndex, pageAccessToken) {
  try {
    const context = userContext[senderId];
    if (!context || !context.parts) {
      return sendMessage(senderId, { text: `⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘭𝘪𝘴𝘵 𝘱𝘢𝘳𝘵𝘴 𝘧𝘪𝘳𝘴𝘵 𝘣𝘺 𝘶𝘴𝘪𝘯𝘨 \`wattpad parts [story number]\`.` }, pageAccessToken);
    }

    const part = context.parts[partIndex - 1];
    if (!part) {
      return sendMessage(senderId, { text: `⚠️ 𝘐𝘯𝘷𝘢𝘭𝘪𝘥 𝘱𝘢𝘳𝘵 𝘯𝘶𝘮𝘣𝘦𝘳.` }, pageAccessToken);
    }

    const chapter = await scraper.getChapter(part.link);
    sendMessage(senderId, {
      text: `📖 𝘊𝘩𝘢𝘱𝘵𝘦𝘳 𝘛𝘪𝘵𝘭𝘦: ${part.title}\n\n${chapter.text.slice(0, 2000)}\n\n🔗 𝘍𝘶𝘭𝘭 𝘊𝘩𝘢𝘱𝘵𝘦𝘳: ${part.link}`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to fetch chapter content.");
  }
}
