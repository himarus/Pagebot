const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();
let searchResultsCache = {}; // Cache to store search results temporarily

module.exports = {
  name: "wattpad",
  description: "Interact with Wattpad stories (search, read chapters, list parts).",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const mainArg = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");

    if (!mainArg) {
      return sendMessage(
        senderId,
        {
          text: `✨ 𝘞𝘢𝘵𝘵𝘱𝘢𝘥 𝘊𝘰𝘮𝘮𝘢𝘯𝘥𝘴
- 📚 𝘚𝘦𝘢𝘳𝘤𝘩:
   𝘛𝘺𝘱𝘦 \`wattpad [title]\` 𝘵𝘰 𝘧𝘪𝘯𝘥 𝘴𝘵𝘰𝘳𝘪𝘦𝘴.

- 📖 𝘙𝘦𝘢𝘥 𝘚𝘵𝘰𝘳𝘺:
   𝘌𝘹: \`wattpad read 1 3\`
   𝘙𝘦𝘢𝘥 𝘢 𝘤𝘩𝘢𝘱𝘵𝘦𝘳 𝘣𝘺 𝘴𝘱𝘦𝘤𝘪𝘧𝘺𝘪𝘯𝘨 𝘵𝘩𝘦 𝘴𝘵𝘰𝘳𝘺 𝘯𝘶𝘮𝘣𝘦𝘳 𝘢𝘯𝘥 𝘤𝘩𝘢𝘱𝘵𝘦𝘳.`,
        },
        pageAccessToken
      );
    }

    try {
      if (mainArg === "read") {
        await readStoryChapter(senderId, args, pageAccessToken);
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

    // Cache search results
    searchResultsCache[senderId] = stories;

    const resultText = stories
      .map(
        (story, index) =>
          `${index + 1}. 𝘛𝘪𝘵𝘭𝘦: ${story.title}\n   𝘈𝘶𝘵𝘩𝘰𝘳: ${story.author}\n   𝘙𝘦𝘢𝘥𝘴: ${story.reads} | 𝘝𝘰𝘵𝘦𝘴: ${story.votes}`
      )
      .join("\n\n");

    sendMessage(
      senderId,
      {
        text: `🔍 𝘚𝘦𝘢𝘳𝘤𝘩 𝘙𝘦𝘴𝘶𝘭𝘵𝘴 𝘧𝘰𝘳 "${query}":\n\n${resultText}\n\n📖 𝘜𝘴𝘦: \`wattpad read [story number] [chapter number]\` 𝘵𝘰 𝘳𝘦𝘢𝘥 𝘢 𝘴𝘱𝘦𝘤𝘪𝘧𝘪𝘤 𝘤𝘩𝘢𝘱𝘵𝘦.`,
      },
      pageAccessToken
    );
  } catch (error) {
    throw new Error("Failed to search Wattpad stories.");
  }
}

async function readStoryChapter(senderId, args, pageAccessToken) {
  const storyNumber = parseInt(args[1], 10);
  const chapterNumber = parseInt(args[2], 10);

  if (isNaN(storyNumber) || isNaN(chapterNumber)) {
    return sendMessage(
      senderId,
      { text: `⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘷𝘢𝘭𝘪𝘥 𝘯𝘶𝘮𝘣𝘦𝘳𝘴 𝘧𝘰𝘳 𝘴𝘵𝘰𝘳𝘺 𝘢𝘯𝘥 𝘤𝘩𝘢𝘱𝘵𝘦𝘳.` },
      pageAccessToken
    );
  }

  const stories = searchResultsCache[senderId];
  if (!stories || !stories[storyNumber - 1]) {
    return sendMessage(senderId, { text: `⚠️ 𝘚𝘵𝘰𝘳𝘺 ${storyNumber} 𝘯𝘰𝘵 𝘧𝘰𝘶𝘯𝘥. 𝘚𝘦𝘢𝘳𝘤𝘩 𝘧𝘪𝘳𝘴𝘵 𝘵𝘰 𝘨𝘦𝘵 𝘢 𝘭𝘪𝘴𝘵 𝘰𝘧 𝘴𝘵𝘰𝘳𝘪𝘦𝘴.` }, pageAccessToken);
  }

  const story = stories[storyNumber - 1];
  try {
    const parts = await scraper.getParts(story.link);
    const selectedPart = parts[chapterNumber - 1];

    if (!selectedPart) {
      return sendMessage(senderId, { text: `⚠️ 𝘊𝘩𝘢𝘱𝘵𝘦𝘳 ${chapterNumber} 𝘯𝘰𝘵 𝘧𝘰𝘶𝘯𝘥 𝘪𝘯 "${story.title}".` }, pageAccessToken);
    }

    const pages = await scraper.read(selectedPart.link);
    const contentText = pages.map((page) => `𝘗𝘢𝘨𝘦 ${page.pageNumber}:\n${page.content}`).join("\n\n");

    sendMessage(
      senderId,
      { text: `📖 𝘙𝘦𝘢𝘥𝘪𝘯𝘨 𝘊𝘩𝘢𝘱𝘵𝘦𝘳 ${chapterNumber} 𝘰𝘧 "${story.title}":\n\n${contentText}` },
      pageAccessToken
    );
  } catch (error) {
    throw new Error("Failed to read the chapter.");
  }
}
