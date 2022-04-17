import config from "./config.js";
import { Client } from "discord.js";
import http from "http";
import * as commands from "./commands/index.js";
import checkForNewChap from "./notifyChapter.js";

export const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "DIRECT_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
  ],
});

client.once("ready", () => {
  console.log("🤖 Discord bot is ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  commands[commandName].execute(interaction);
});

setInterval(async () => {
  console.log("🔃 Fetching new chapters....");
  const newChap = await checkForNewChap();
  if (newChap.length > 0) {
    newChap.map((chap) => {
      let message = `${
        chap.isImportant ? "<@786569518256226325> " : ""
      }📃 New chapter of ${chap.name} is available! \n${chap.url}`;
      client.channels.cache.get("965269327580381304").send(message);
    });
    console.log("🎉 New chapters found!");
  } else {
    console.log("💥 No new chapters found!");
  }
}, 60000);

client.login(config.DISCORD_TOKEN);
http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
  })
  .listen(process.env.PORT);
