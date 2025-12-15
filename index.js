const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("Bot en ligne 🚀");
});

client.on("messageCreate", message => {
  if (message.content === "!ping") {
    message.reply("Pong 🏓");
  }
});

client.login(process.env.TOKEN);
const db = require("quick.db");

const XP_PER_MESSAGE = 10;
const LEVEL_ROLES = {5: "Novice", 10: "Expert", 20: "Maître"};

client.on("messageCreate", async message => {
  if(message.author.bot || !message.guild) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  let xp = db.get(`${guildId}.${userId}.xp`) || 0;
  let level = db.get(`${guildId}.${userId}.level`) || 1;

  xp += XP_PER_MESSAGE;
  let nextLevel = Math.floor(0.1 * Math.sqrt(xp));

  if(nextLevel > level){
    level = nextLevel;
    message.channel.send(`${message.author} a atteint le niveau ${level} ! 🎉`);

    if(LEVEL_ROLES[level]){
      let role = message.guild.roles.cache.find(r => r.name === LEVEL_ROLES[level]);
      if(!role) role = await message.guild.roles.create({name: LEVEL_ROLES[level], color: "BLUE"});
      message.member.roles.add(role);
    }
  }

  db.set(`${guildId}.${userId}.xp`, xp);
  db.set(`${guildId}.${userId}.level`, level);

  if(message.content === "!level") message.reply(`Tu es niveau ${level} avec ${xp} XP.`);
  if(message.content === "!leaderboard"){
    const data = db.get(`${guildId}`) || {};
    const leaderboard = Object.keys(data).map(id => ({id, level: data[id].level||1, xp:data[id].xp||0}))
      .sort((a,b) => b.level - a.level || b.xp - a.xp)
      .slice(0,10);
    let text = "🏆 **Leaderboard** 🏆\n";
    leaderboard.forEach((u,i)=>{
      const member = message.guild.members.cache.get(u.id);
      text += `${i+1}. ${member ? member.user.tag : "Utilisateur supprimé"} - Niveau ${u.level} (${u.xp} XP)\n`;
    });
    message.channel.send(text);
  }
});

