const { Client, GatewayIntentBits } = require("discord.js");

// Liste de tes tokens (mettre tes propres bots)
const tokens = [
  process.env.BOT1_TOKEN,
  process.env.BOT2_TOKEN
  // Ajoute autant de tokens que tu veux
];

tokens.forEach((token, index) => {
  const bot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  bot.once("ready", () => {
    console.log(`Bot #${index + 1} (${bot.user.tag}) en ligne 🚀`);
  });

  bot.on("messageCreate", message => {
    if (message.author.bot) return;

    // Exemple de commande simple
    if (message.content === "!ping") {
      message.reply(`Pong ! Je suis ${bot.user.username}`);
    }
  });

  bot.login(token).catch(err => {
    console.log(`Impossible de connecter le bot #${index + 1}:`, err);
  });
});
