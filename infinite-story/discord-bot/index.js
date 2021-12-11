const Eris = require("eris");
const fetch = require("node-fetch");
const bot = new Eris("CHANGE_ME");
const restBot = new Eris("CHANGE_ME", {restMode: true});
const rexRole = ''
const guildId = ''
bot.on("ready", () => {
  // When the bot is ready
  console.log("Ready!"); // Log "Ready!"
});

bot.on("messageCreate", async msg => {
  if (msg.channel.name === "welcome") {
    console.log("A new user joined");
    console.log(JSON.stringify(msg));
    console.log("DMing the user....");
    const user = msg.author;
    const channel = await user.getDMChannel();
    console.log("Generating a discord code...");
    const res = await fetch("https://api.infinitestory.app/discord_link", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ discord_id: user.id })
    });
    const content = await res.json();
    await channel.createMessage(`Hey ${user.username}! Here is the code you need to put in the app to link your Discord account and access your ??? class: **${content.code}**`);
  } else {
    if(msg.content.toLowerCase() === "hail rex"){
      console.log(msg.channel.guild);
      await msg.channel.guild.addMemberRole(msg.author.id, rexRole);
      await msg.channel.createMessage(`${msg.author.username} is now a Priest of Rex. Hail Rex!`);
      await msg.delete();
    }
  }
});

bot.connect(); // Get the bot to connect to Discord
