// Import des librairies
const { Client, GatewayIntentBits } = require("discord.js");
const db = require("quick.db");

// Création du client Discord avec les intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // Accès aux serveurs
    GatewayIntentBits.GuildMessages,    // Accès aux messages
    GatewayIntentBits.MessageContent    // Lire le texte des messages
  ]
});

// XP par message
const XP_PER_MESSAGE = 10;

// Rôles automatiques selon le niveau
const LEVEL_ROLES = {
  5: "Novice",
  10: "Expert",
  20: "Maître"
};

// Quand le bot est prêt
client.once("ready", () => {
  console.log("Bot en ligne 🚀");
});

// Gestion des messages
client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  // Récupérer XP et niveau depuis la base
  let xp = db.get(`${guildId}.${userId}.xp`) || 0;
  let level = db.get(`${guildId}.${userId}.level`) || 1;

  // Ajouter de l'XP
  xp += XP_PER_MESSAGE;

  // Calcul du nouveau niveau
  let nextLevel = Math.floor(0.1 * Math.sqrt(xp));

  // Si le joueur monte de niveau
  if (nextLevel > level) {
    level = nextLevel;
    message.channel.send(`${message.author} a atteint le niveau ${level} ! 🎉`);

    // Attribution automatique du rôle
    if (LEVEL_ROLES[level]) {
      let role = message.guild.roles.cache.find(r => r.name === LEVEL_ROLES[level]);
      if (!role) {
        role = await message.guild.roles.create({ name: LEVEL_ROLES[level], color: "BLUE" });
      }
      message.member.roles.add(role).catch(err => console.log(err));
    }
  }

  // Sauvegarder XP et niveau
  db.set(`${guildId}.${userId}.xp`, xp);
  db.set(`${guildId}.${userId}.level`, level);

  // Commande !level
  if (message.content === "!level") {
    message.reply(`Tu es niveau ${level} avec ${xp} XP.`);
  }

  // Commande !leaderboard
  if (message.content === "!leaderboard") {
    let data = db.get(`${guildId}`) || {};
    let leaderboard = Object.keys(data)
      .map(id => ({ id, level: data[id].level || 1, xp: data[id].xp || 0 }))
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .slice(0, 10);

    let text = "🏆 **Leaderboard** 🏆\n";
    leaderboard.forEach((u, i) => {
      const member = message.guild.members.cache.get(u.id);
      text += `${i + 1}. ${member ? member.user.tag : "Utilisateur supprimé"} - Niveau ${u.level} (${u.xp} XP)\n`;
    });
    message.channel.send(text);
  }
});

// Connexion du bot avec le token
client.login(process.env.TOKEN);
