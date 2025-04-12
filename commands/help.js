const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹",
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
};

const convertToGothic = (text) => {
  return text.split('').map(char => gothicFont[char] || char).join('');
};

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'chilli',
  execute(kupal, pogi, sili) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file) => {
      const command = require(path.join(commandsDir, file));
      if (command.name) return command.name;
      return null;
    }).filter(name => name !== null);

    const totalCommands = commands.length;

    const helpTextMessage = `${convertToGothic('📋 | 𝖢𝖬𝖣𝖲 𝖫𝗂𝗌𝗍: 〔𝗇𝗈 𝗉𝗋𝖾𝖿𝗂𝗑〕')}\n${convertToGothic(`🏷 Total Commands: ${totalCommands}`)}\n\n${commands.map((name, index) => `${convertToGothic(`${index + 1}. ${name}`)}`).join('\n')}\n\n${convertToGothic('ℹ 𝗪𝗲 𝗮𝗹𝘀𝗼 𝗵𝗮𝘃𝗲 𝗮𝗻 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝗧𝗶𝗸𝗧𝗼𝗸 𝗮𝗻𝗱 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝘃𝗶𝗱𝗲𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿! 𝗝𝘂𝘀𝘁 𝘀𝗲𝗻𝗱 𝗮 𝗹𝗶𝗻𝗸.')}\n\n${convertToGothic('⚙ 𝗙𝗼𝗿 𝗶𝘀𝘀𝘂𝗲𝘀 𝗼𝗿 𝗿𝗲𝗽𝗼𝗿𝘁𝘀, 𝗰𝗼𝗻𝘁𝗮𝗰𝘁 𝘁𝗵𝗲 𝗱𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿:')}\nFB Link: https://www.facebook.com/Churchill.Dev4100`;

    sendMessage(kupal, { text: helpTextMessage }, sili);
  }
};
